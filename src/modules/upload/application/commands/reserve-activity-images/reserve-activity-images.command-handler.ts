import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Kysely } from 'kysely';
import { randomUUID, createHash } from 'crypto';
import { Result } from '@/common/domain/result';
import { BusinessError } from '@/common/domain/error';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import {
  ReserveActivityImagesDto,
  ReserveActivityImagesResponse,
} from './reserve-activity-images.dto';
import { R2SignerService } from '@/modules/upload/infrastructure/r2-signer.service';
import { UploadSessionStatus } from '@/modules/upload/domain/upload-session.entity';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

export class ReserveActivityImagesCommand {
  constructor(
    public readonly userId: string,
    public readonly actorKey: string,
    public readonly data: ReserveActivityImagesDto,
    public readonly idempotencyKey?: string,
  ) {}
}

@Injectable()
@CommandHandler(ReserveActivityImagesCommand)
export class ReserveActivityImagesCommandHandler
  implements ICommandHandler<ReserveActivityImagesCommand>
{
  private static readonly requestsByActor = new Map<string, number[]>();
  private readonly logger = new Logger(ReserveActivityImagesCommandHandler.name);
  private readonly idempotencyCache = new Map<string, ReserveActivityImagesResponse>();

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Kysely<any>,
    private readonly r2SignerService: R2SignerService,
  ) {}

  async execute(
    command: ReserveActivityImagesCommand,
  ): Promise<Result<ReserveActivityImagesResponse>> {
    const { userId, idempotencyKey, actorKey, data } = command;
    this.enforceRateLimit(actorKey);

    if (idempotencyKey) {
      const cached = this.idempotencyCache.get(`${userId}:${idempotencyKey}`);
      if (cached) {
        return Result.success(cached);
      }
    }

    const ttlSeconds = this.r2SignerService.getUploadTtlSeconds();
    const bucket = this.r2SignerService.getBucketName();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
    const requestFingerprint = createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');

    const items = await this.db.transaction().execute(async (trx) => {
      const rows: ReserveActivityImagesResponse['items'] = [];

      for (const file of data.files) {
        const uploadId = randomUUID();
        const objectKey = this.r2SignerService.createObjectKey(
          userId,
          uploadId,
          file.content_type,
        );
        const signedUpload = this.r2SignerService.createPresignedPutObject({
          objectKey,
          contentType: file.content_type,
          expiresInSeconds: ttlSeconds,
        });

        await trx
          .insertInto('upload_sessions')
          .values({
            id: uploadId,
            user_id: userId,
            object_key: objectKey,
            bucket,
            status: UploadSessionStatus.RESERVED,
            content_type: file.content_type,
            max_size_bytes: file.size_bytes,
            expires_at: expiresAt,
            idempotency_key: idempotencyKey ?? null,
            request_fingerprint: requestFingerprint,
          })
          .execute();

        rows.push({
          upload_id: uploadId,
          object_key: objectKey,
          put_url: signedUpload.putUrl,
          required_headers: signedUpload.requiredHeaders,
          expires_at: expiresAt.toISOString(),
        });
      }

      return rows;
    });

    const response = { items };
    if (idempotencyKey) {
      this.idempotencyCache.set(`${userId}:${idempotencyKey}`, response);
    }

    this.logger.log(
      `Reserve upload slots user=${userId} count=${response.items.length} activity_ref=${data.activity_client_ref}`,
    );

    return Result.success(response);
  }

  private enforceRateLimit(actorKey: string): void {
    const now = Date.now();
    const requestTimestamps =
      ReserveActivityImagesCommandHandler.requestsByActor.get(actorKey) ?? [];
    const freshTimestamps = requestTimestamps.filter(
      (timestamp) => now - timestamp <= RATE_LIMIT_WINDOW_MS,
    );

    if (freshTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
      throw BusinessError.Problem(
        'UPLOAD.RATE_LIMITED',
        'Too many reserve requests. Try again shortly.',
      );
    }

    freshTimestamps.push(now);
    ReserveActivityImagesCommandHandler.requestsByActor.set(actorKey, freshTimestamps);
  }
}
