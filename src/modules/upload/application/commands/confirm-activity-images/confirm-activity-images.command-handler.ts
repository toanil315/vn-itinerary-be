import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Kysely, sql } from 'kysely';
import { Result } from '@/common/domain/result';
import { BusinessError } from '@/common/domain/error';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import {
  ConfirmActivityImagesDto,
  ConfirmActivityImagesResponse,
} from './confirm-activity-images.dto';
import { R2SignerService } from '@/modules/upload/infrastructure/r2-signer.service';
import { UploadSessionStatus } from '@/modules/upload/domain/upload-session.entity';

export class ConfirmActivityImagesCommand {
  constructor(
    public readonly userId: string,
    public readonly data: ConfirmActivityImagesDto,
  ) {}
}

@Injectable()
@CommandHandler(ConfirmActivityImagesCommand)
export class ConfirmActivityImagesCommandHandler
  implements ICommandHandler<ConfirmActivityImagesCommand>
{
  private readonly logger = new Logger(ConfirmActivityImagesCommandHandler.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Kysely<any>,
    private readonly r2SignerService: R2SignerService,
  ) {}

  async execute(
    command: ConfirmActivityImagesCommand,
  ): Promise<Result<ConfirmActivityImagesResponse>> {
    const { userId, data } = command;
    const uploadIds = Array.from(new Set(data.upload_ids));

    const confirmedItems = await this.db.transaction().execute(async (trx) => {
      const sessions = await trx
        .selectFrom('upload_sessions')
        .selectAll()
        .where('id', 'in', uploadIds)
        .where('user_id', '=', userId)
        .forUpdate()
        .execute();

      if (sessions.length !== uploadIds.length) {
        throw BusinessError.Problem(
          'UPLOAD.NOT_FOUND',
          'One or more uploads were not found for current user.',
        );
      }

      const now = new Date();
      const items: ConfirmActivityImagesResponse['items'] = [];

      for (const session of sessions) {
        if (session.expires_at < now) {
          await this.markRejected(session.id, trx);
          throw BusinessError.Problem('UPLOAD.EXPIRED', `Upload ${session.id} is expired.`);
        }

        if (session.consumed_at) {
          throw BusinessError.Conflict(
            'UPLOAD.ALREADY_CONSUMED',
            `Upload ${session.id} was already attached to an itinerary.`,
          );
        }

        if (session.status === UploadSessionStatus.CONFIRMED) {
          items.push({
            upload_id: session.id,
            object_key: session.object_key,
            content_type: session.content_type,
            size_bytes: session.size_bytes ?? session.max_size_bytes,
            confirmed_at: (session.confirmed_at ?? now).toISOString(),
          });
          continue;
        }

        if (session.status !== UploadSessionStatus.RESERVED) {
          throw BusinessError.Problem(
            'UPLOAD.INVALID_STATUS',
            `Upload ${session.id} is not in reservable state.`,
          );
        }

        const headUrl = this.r2SignerService.createPresignedHeadObject(session.object_key);
        const headResponse = await fetch(headUrl, { method: 'HEAD' });
        if (!headResponse.ok) {
          await this.markRejected(session.id, trx);
          throw BusinessError.Problem(
            'UPLOAD.OBJECT_MISSING',
            `Uploaded object for ${session.id} was not found.`,
          );
        }

        const contentLength = Number(headResponse.headers.get('content-length') ?? 0);
        const contentType = headResponse.headers.get('content-type') ?? '';

        if (!contentLength || Number.isNaN(contentLength) || contentLength > session.max_size_bytes) {
          await this.markRejected(session.id, trx);
          throw BusinessError.Problem('UPLOAD.INVALID_SIZE', `Upload ${session.id} size is invalid.`);
        }

        if (!contentType.startsWith(session.content_type)) {
          await this.markRejected(session.id, trx);
          throw BusinessError.Problem(
            'UPLOAD.INVALID_MIME',
            `Upload ${session.id} content type does not match reservation.`,
          );
        }

        await trx
          .updateTable('upload_sessions')
          .set({
            status: UploadSessionStatus.CONFIRMED,
            size_bytes: contentLength,
            uploaded_at: now,
            confirmed_at: now,
            updated_at: sql`now()`,
          })
          .where('id', '=', session.id)
          .execute();

        items.push({
          upload_id: session.id,
          object_key: session.object_key,
          content_type: session.content_type,
          size_bytes: contentLength,
          confirmed_at: now.toISOString(),
        });
      }

      return items;
    });

    this.logger.log(`Confirm uploads user=${userId} upload_ids=${uploadIds.join(',')}`);
    return Result.success({ items: confirmedItems });
  }

  private async markRejected(uploadId: string, trx: Kysely<any>): Promise<void> {
    await trx
      .updateTable('upload_sessions')
      .set({
        status: UploadSessionStatus.REJECTED,
        updated_at: sql`now()`,
      })
      .where('id', '=', uploadId)
        .execute();
  }
}
