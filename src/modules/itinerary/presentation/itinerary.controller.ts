import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  PermissionKeys,
  RequirePermission,
  type AuthenticatedUser,
} from '@/modules/auth/public';
import { CreateItineraryDto } from '../application/commands/create-itinerary/create-itinerary.dto';
import { CreateItineraryCommand } from '../application/commands/create-itinerary/create-itinerary.command';
import { UpdateItineraryDto } from '../application/commands/update-itinerary/update-itinerary.dto';
import { UpdateItineraryCommand } from '../application/commands/update-itinerary/update-itinerary.command';
import { PublishItineraryCommand } from '../application/commands/publish-itinerary/publish-itinerary.command';
import { ArchiveItineraryCommand } from '../application/commands/archive-itinerary/archive-itinerary.command';
import { ListMyItinerariesQuery } from '../application/queries/list-my-itineraries/list-my-itineraries.query';

@ApiTags('Itineraries')
@ApiBearerAuth()
@Controller()
export class ItineraryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Create Itinerary Draft' })
  @RequirePermission(PermissionKeys.ITINERARY_CREATE)
  @Post('v1/itineraries')
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateItineraryDto
  ) {
    const result = await this.commandBus.execute(
      new CreateItineraryCommand(user.userId, dto)
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'Update Itinerary Draft' })
  @RequirePermission(PermissionKeys.ITINERARY_UPDATE)
  @Patch('v1/itineraries/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateItineraryDto
  ) {
    const result = await this.commandBus.execute(
      new UpdateItineraryCommand(id, user.userId, dto)
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'Publish Itinerary' })
  @RequirePermission(PermissionKeys.ITINERARY_PUBLISH)
  @Post('v1/itineraries/:id/publish')
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const result = await this.commandBus.execute(
      new PublishItineraryCommand(id, user.userId)
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'Archive Itinerary' })
  @RequirePermission(PermissionKeys.ITINERARY_ARCHIVE)
  @Post('v1/itineraries/:id/archive')
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const result = await this.commandBus.execute(
      new ArchiveItineraryCommand(id, user.userId)
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'List My Itineraries' })
  @RequirePermission(PermissionKeys.ITINERARY_LIST_OWN)
  @Get('v1/me/itineraries')
  async listMy(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const result = await this.queryBus.execute(
      new ListMyItinerariesQuery(user.userId, page, limit)
    );
    return result.unwrap();
  }
}
