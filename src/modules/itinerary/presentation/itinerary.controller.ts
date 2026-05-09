import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { CreateItineraryDto } from "../application/commands/create-itinerary/create-itinerary.dto";
import { CreateItineraryCommand } from "../application/commands/create-itinerary/create-itinerary.command";
import { UpdateItineraryDto } from "../application/commands/update-itinerary/update-itinerary.dto";
import { UpdateItineraryCommand } from "../application/commands/update-itinerary/update-itinerary.command";
import { PublishItineraryCommand } from "../application/commands/publish-itinerary/publish-itinerary.command";
import { ArchiveItineraryCommand } from "../application/commands/archive-itinerary/archive-itinerary.command";
import { ListMyItinerariesQuery } from "../application/queries/list-my-itineraries/list-my-itineraries.query";
import { CreateItineraryResponseDto } from "../application/commands/create-itinerary/create-itinerary.dto";
import { ListMyItinerariesResponse } from "../application/queries/list-my-itineraries/list-my-itineraries.dto";

@ApiTags("Itineraries")
@ApiBearerAuth()
@Controller()
export class ItineraryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: "Update Itinerary Draft (supports activities[].images[])",
  })
  @ApiResponse({
    description: "Itinerary draft updated successfully",
    type: EmptyResponse,
  })
  @RequirePermission(PermissionKeys.ITINERARY_UPDATE)
  @Patch("v1/itineraries/:id")
  async update(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateItineraryDto,
  ) {
    return this.commandBus.execute(
      new UpdateItineraryCommand(id, user.userId, dto),
    );
  }

  @ApiOperation({ summary: "Publish Itinerary" })
  @ApiResponse({
    description: "Itinerary published successfully",
    type: EmptyResponse,
  })
  @RequirePermission(PermissionKeys.ITINERARY_PUBLISH)
  @Post("v1/itineraries/:id/publish")
  async publish(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new PublishItineraryCommand(id, user.userId),
    );
  }

  @ApiOperation({ summary: "Archive Itinerary" })
  @ApiResponse({
    description: "Itinerary archived successfully",
    type: EmptyResponse,
  })
  @RequirePermission(PermissionKeys.ITINERARY_ARCHIVE)
  @Post("v1/itineraries/:id/archive")
  async archive(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new ArchiveItineraryCommand(id, user.userId),
    );
  }

  @ApiOperation({ summary: "List My Itineraries" })
  @ApiResponse({
    description: "My itineraries list retrieved successfully",
    type: ListMyItinerariesResponse,
  })
  @RequirePermission(PermissionKeys.ITINERARY_LIST_OWN)
  @Get("v1/me/itineraries")
  async listMy(
    @CurrentUser() user: AuthenticatedUser,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.queryBus.execute(
      new ListMyItinerariesQuery(user.userId, page, limit),
    );
  }
}
