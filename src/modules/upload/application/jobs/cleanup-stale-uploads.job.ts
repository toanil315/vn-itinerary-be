import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, sql } from 'kysely';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import { UploadSessionStatus } from '@/modules/upload/domain/upload-session.entity';
import { R2SignerService } from '@/modules/upload/infrastructure/r2-signer.service';

@Injectable()
export class CleanupStaleUploadsJob implements OnModuleInit {
  private readonly logger = new Logger(CleanupStaleUploadsJob.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Kysely<any>,
    private readonly configService: ConfigService,
    private readonly r2SignerService: R2SignerService,
  ) {}

  onModuleInit(): void {
    const intervalSeconds = this.configService.getOrThrow<number>(
      'UPLOAD_CLEANUP_INTERVAL_SECONDS',
    );
    const timer = setInterval(() => {
      this.run().catch((error: unknown) =>
        this.logger.error('Upload cleanup failed', error as Error),
      );
    }, intervalSeconds * 1000);
    timer.unref();
  }

  async run(): Promise<void> {
    const now = new Date();
    const staleUploads = await this.db
      .selectFrom('upload_sessions')
      .select(['id', 'object_key', 'status'])
      .where('expires_at', '<', now)
      .where('consumed_at', 'is', null)
      .where('status', 'in', [UploadSessionStatus.RESERVED, UploadSessionStatus.CONFIRMED])
      .execute();

    if (staleUploads.length === 0) {
      return;
    }

    const staleIds = staleUploads.map((row) => row.id);
    await this.db
      .updateTable('upload_sessions')
      .set({
        status: UploadSessionStatus.EXPIRED,
        updated_at: sql`now()`,
      })
      .where('id', 'in', staleIds)
      .execute();

    if (this.configService.getOrThrow<string>('UPLOAD_CLEANUP_DELETE_OBJECTS') !== 'true') {
      this.logger.log(`Expired stale upload sessions count=${staleIds.length}`);
      return;
    }

    for (const staleUpload of staleUploads) {
      try {
        const deleteUrl = this.r2SignerService.createPresignedDeleteObject(
          staleUpload.object_key,
        );
        await fetch(deleteUrl, { method: 'DELETE' });
      } catch (error: unknown) {
        this.logger.warn(`Failed deleting stale upload object upload_id=${staleUpload.id}`);
        this.logger.warn(error as Error);
      }
    }

    this.logger.log(`Expired and attempted object cleanup count=${staleIds.length}`);
  }
}

