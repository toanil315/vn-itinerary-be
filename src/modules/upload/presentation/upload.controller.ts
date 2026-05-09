import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { ApiResponse } from '@/common/http/swagger.response-decorator';
import {
  CurrentUser,
  PermissionKeys,
  RequirePermission,
  type AuthenticatedUser,
} from '@/modules/auth/public';
import {
  ReserveActivityImagesDto,
  ReserveActivityImagesResponseDto,
} from '../application/commands/reserve-activity-images/reserve-activity-images.dto';
import {
  ReserveActivityImagesCommand,
} from '../application/commands/reserve-activity-images/reserve-activity-images.command-handler';
import {
  ConfirmActivityImagesDto,
  ConfirmActivityImagesResponseDto,
} from '../application/commands/confirm-activity-images/confirm-activity-images.dto';
import {
  ConfirmActivityImagesCommand,
} from '../application/commands/confirm-activity-images/confirm-activity-images.command-handler';

@ApiTags('Activity Image Uploads')
@ApiBearerAuth()
@Controller('v1/activity-images/uploads')
export class UploadController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('reserve')
  @ApiOperation({ summary: 'Reserve signed upload URLs for activity images' })
  @ApiResponse({
    description: 'Upload slots reserved successfully',
    type: ReserveActivityImagesResponseDto,
  })
  @RequirePermission(PermissionKeys.ITINERARY_CREATE)
  async reserve(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: ReserveActivityImagesDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    const ip = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const actorKey = `${user.userId}:${String(ip ?? 'unknown')}`;
    return this.commandBus.execute(
      new ReserveActivityImagesCommand(user.userId, actorKey, dto, idempotencyKey),
    );
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm uploaded activity images after direct R2 upload' })
  @ApiResponse({
    description: 'Uploads confirmed successfully',
    type: ConfirmActivityImagesResponseDto,
  })
  @RequirePermission(PermissionKeys.ITINERARY_CREATE)
  async confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfirmActivityImagesDto,
  ) {
    return this.commandBus.execute(new ConfirmActivityImagesCommand(user.userId, dto));
  }
}

