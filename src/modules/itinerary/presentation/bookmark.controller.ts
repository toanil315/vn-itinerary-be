import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiResponse } from "@/common/http/swagger.response-decorator";
import { EmptyResponse } from "@/common/http/empty-response.dto";
import {
  CurrentUser,
  PermissionKeys,
  RequirePermission,
  type AuthenticatedUser,
} from "@/modules/auth/public";
import { CreateBookmarkDto } from "../application/commands/create-bookmark/create-bookmark.dto";
import { CreateBookmarkCommand } from "../application/commands/create-bookmark/create-bookmark.command";
import { DeleteBookmarkCommand } from "../application/commands/delete-bookmark/delete-bookmark.command";
import { ListMyBookmarksQuery } from "../application/queries/list-my-bookmarks/list-my-bookmarks.query";
import { ListItinerariesResponse } from "../application/queries/list-itineraries/list-itineraries.dto";

@ApiTags("Bookmarks")
@ApiBearerAuth()
@Controller()
export class BookmarkController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: "Create Bookmark" })
  @ApiResponse({
    description: "Bookmark created successfully",
    type: EmptyResponse,
  })
  @RequirePermission(PermissionKeys.BOOKMARK_CREATE)
  @Post("v1/bookmarks")
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.commandBus.execute(
      new CreateBookmarkCommand(user.userId, dto.itineraryId),
    );
  }

  @ApiOperation({ summary: "Delete Bookmark" })
  @ApiResponse({
    description: "Bookmark deleted successfully",
    type: EmptyResponse,
  })
  @RequirePermission(PermissionKeys.BOOKMARK_DELETE)
  @Delete("v1/bookmarks/:itineraryId")
  async delete(
    @Param("itineraryId") itineraryId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new DeleteBookmarkCommand(user.userId, itineraryId),
    );
  }

  @ApiOperation({ summary: "List My Bookmarks" })
  @ApiResponse({
    description: "Bookmarks list retrieved successfully",
    type: ListItinerariesResponse,
  })
  @RequirePermission(PermissionKeys.BOOKMARK_LIST)
  @Get("v1/me/bookmarks")
  async listMy(
    @CurrentUser() user: AuthenticatedUser,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.queryBus.execute(
      new ListMyBookmarksQuery(user.userId, page, limit),
    );
  }
}
