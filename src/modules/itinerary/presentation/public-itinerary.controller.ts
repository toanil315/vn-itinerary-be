import { Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { QueryBus, CommandBus } from "@nestjs/cqrs";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/modules/auth/public";
import { ListItinerariesQuery } from "../application/queries/list-itineraries/list-itineraries.query";
import { GetTrendingItinerariesQuery } from "../application/queries/get-trending/get-trending.query";
import { GetItineraryDetailQuery } from "../application/queries/get-itinerary-detail/get-itinerary-detail.query";
import { GetLeaderboardQuery } from "../application/queries/get-leaderboard/get-leaderboard.query";
import { TrackViewCommand } from "../application/commands/track-view/track-view.command";
import { createHash } from "crypto";
import type { Request } from "express";
import { ApiResponse } from "@/common/http/swagger.response-decorator";
import { ListItinerariesResponse } from "../application/queries/list-itineraries/list-itineraries.dto";
import { ItineraryDetailResponse } from "../application/queries/get-itinerary-detail/get-itinerary-detail.dto";
import { LeaderboardResponse } from "../application/queries/get-leaderboard/get-leaderboard.dto";
import { EmptyResponse } from "@/common/http/empty-response.dto";

@ApiTags("Public Itineraries")
@Controller()
export class PublicItineraryController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOperation({ summary: "List Public Itineraries" })
  @ApiResponse({
    description: "Itineraries list retrieved successfully",
    type: ListItinerariesResponse,
  })
  @Public()
  @Get("v1/itineraries")
  async list(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("region") region?: string,
    @Query("tag") tag?: string,
  ) {
    return this.queryBus.execute(
      new ListItinerariesQuery(page, limit, region, tag),
    );
  }

  @ApiOperation({ summary: "Get Trending Itineraries" })
  @ApiResponse({
    description: "Trending itineraries retrieved successfully",
    type: ListItinerariesResponse,
  })
  @Public()
  @Get("v1/itineraries/trending")
  async getTrending() {
    return this.queryBus.execute(new GetTrendingItinerariesQuery());
  }

  @ApiOperation({ summary: "Get Itinerary Detail" })
  @ApiResponse({
    description: "Itinerary detail retrieved successfully",
    type: ItineraryDetailResponse,
  })
  @Public()
  @Get("v1/itineraries/:slug")
  async getDetail(@Param("slug") slug: string) {
    return this.queryBus.execute(new GetItineraryDetailQuery(slug));
  }

  @ApiOperation({ summary: "Get Leaderboard" })
  @ApiResponse({
    description: "Leaderboard retrieved successfully",
    type: LeaderboardResponse,
  })
  @Public()
  @Get("v1/leaderboard")
  async getLeaderboard() {
    return this.queryBus.execute(new GetLeaderboardQuery());
  }

  @ApiOperation({ summary: "Track Itinerary View" })
  @ApiResponse({
    description: "Itinerary view tracked successfully",
    type: EmptyResponse,
  })
  @Public()
  @Post("v1/itineraries/:id/views")
  async trackView(@Param("id") id: string, @Req() req: Request) {
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const ipHash = ip
      ? createHash("sha256").update(String(ip)).digest("hex")
      : undefined;
    const userAgent = req.headers["user-agent"];
    const userId = (req as any).user?.userId; // Optional if logged in

    return this.commandBus.execute(
      new TrackViewCommand(id, userId, ipHash, userAgent),
    );
  }
}
