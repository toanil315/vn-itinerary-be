import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UploadController } from './presentation/upload.controller';
import { R2SignerService } from './infrastructure/r2-signer.service';
import { ReserveActivityImagesCommandHandler } from './application/commands/reserve-activity-images/reserve-activity-images.command-handler';
import { ConfirmActivityImagesCommandHandler } from './application/commands/confirm-activity-images/confirm-activity-images.command-handler';
import { CleanupStaleUploadsJob } from './application/jobs/cleanup-stale-uploads.job';

@Module({
  imports: [CqrsModule],
  controllers: [UploadController],
  providers: [
    R2SignerService,
    ReserveActivityImagesCommandHandler,
    ConfirmActivityImagesCommandHandler,
    CleanupStaleUploadsJob,
  ],
  exports: [R2SignerService],
})
export class UploadModule {}

