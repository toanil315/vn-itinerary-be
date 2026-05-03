import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateBookmarkDto } from '../application/commands/create-bookmark/create-bookmark.dto';
import { CreateBookmarkCommand } from '../application/commands/create-bookmark/create-bookmark.command';
import { DeleteBookmarkCommand } from '../application/commands/delete-bookmark/delete-bookmark.command';
import { ListMyBookmarksQuery } from '../application/queries/list-my-bookmarks/list-my-bookmarks.query';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@Controller()
export class BookmarkController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Create Bookmark' })
  @RequirePermission(PermissionKeys.BOOKMARK_CREATE)
  @Post('v1/bookmarks')
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBookmarkDto
  ) {
    const result = await this.commandBus.execute(
      new CreateBookmarkCommand(user.userId, dto.itineraryId)
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'Delete Bookmark' })
  @RequirePermission(PermissionKeys.BOOKMARK_DELETE)
  @Delete('v1/bookmarks/:itineraryId')
  async delete(
    @Param('itineraryId') itineraryId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const result = await this.commandBus.execute(
      new DeleteBookmarkCommand(user.userId, itineraryId)
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'List My Bookmarks' })
  @RequirePermission(PermissionKeys.BOOKMARK_LIST)
  @Get('v1/me/bookmarks')
  async listMy(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const result = await this.queryBus.execute(
      new ListMyBookmarksQuery(user.userId, page, limit)
    );
    return result.unwrap();
  }
}
