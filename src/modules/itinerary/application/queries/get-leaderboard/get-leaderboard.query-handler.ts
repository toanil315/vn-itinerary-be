import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetLeaderboardQuery } from "./get-leaderboard.query";
import { Result } from "@/common/domain/result";
import { LeaderboardResponse } from "./get-leaderboard.dto";
import { Inject } from "@nestjs/common";
import { DATABASE_TOKEN } from "@/common/database/database.provider";
import type { Database } from "@/common/database/database";

@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardQueryHandler implements IQueryHandler<GetLeaderboardQuery> {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async execute(
    query: GetLeaderboardQuery,
  ): Promise<Result<LeaderboardResponse>> {
    const { limit } = query;

    const items = await this.db
      .selectFrom("itineraries")
      .select([
        "itineraries.id",
        "itineraries.title",
        "itineraries.slug",
        "itineraries.thumbnail_url",
        "itineraries.view_count",
      ])
      .where("itineraries.status", "=", "published")
      .orderBy("itineraries.view_count", "desc")
      .limit(limit)
      .execute();

    return Result.success({
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        thumbnailUrl: item.thumbnail_url,
        viewCount: item.view_count,
      })),
    });
  }
}
