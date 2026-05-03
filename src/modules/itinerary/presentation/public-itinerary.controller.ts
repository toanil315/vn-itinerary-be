import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/modules/auth/public';
import { ListItinerariesQuery } from '../application/queries/list-itineraries/list-itineraries.query';
import { GetTrendingItinerariesQuery } from '../application/queries/get-trending/get-trending.query';
import { GetItineraryDetailQuery } from '../application/queries/get-itinerary-detail/get-itinerary-detail.query';
import { GetLeaderboardQuery } from '../application/queries/get-leaderboard/get-leaderboard.query';
import { TrackViewCommand } from '../application/commands/track-view/track-view.command';
import type { Request } from 'express';
import { createHash } from 'crypto';

@ApiTags('Public Itineraries')
@Controller()
export class PublicItineraryController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @ApiOperation({ summary: 'List Public Itineraries' })
  @Public()
  @Get('v1/itineraries')
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('region') region?: string,
    @Query('tag') tag?: string
  ) {
    const result = await this.queryBus.execute(
      new ListItinerariesQuery(page, limit, region, tag)
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'Get Trending Itineraries' })
  @Public()
  @Get('v1/itineraries/trending')
  async getTrending() {
    const result = await this.queryBus.execute(
      new GetTrendingItinerariesQuery()
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'Get Itinerary Detail' })
  @Public()
  @Get('v1/itineraries/:slug')
  async getDetail(@Param('slug') slug: string) {
    const result = await this.queryBus.execute(
      new GetItineraryDetailQuery(slug)
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'Get Leaderboard' })
  @Public()
  @Get('v1/leaderboard')
  async getLeaderboard() {
    const result = await this.queryBus.execute(
      new GetLeaderboardQuery()
    );
    return result.unwrap();
  }

  @ApiOperation({ summary: 'Track Itinerary View' })
  @Public()
  @Post('v1/itineraries/:id/views')
  async trackView(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipHash = ip ? createHash('sha256').update(String(ip)).digest('hex') : undefined;
    const userAgent = req.headers['user-agent'];
    const userId = (req as any).user?.userId; // Optional if logged in

    const result = await this.commandBus.execute(
      new TrackViewCommand(id, userId, ipHash, userAgent)
    );
    return result.unwrap();
  }
}
