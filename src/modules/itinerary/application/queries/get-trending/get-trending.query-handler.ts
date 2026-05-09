import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetTrendingItinerariesQuery } from "./get-trending.query";
import { Result } from "@/common/domain/result";
import { ListItinerariesResponse } from "../list-itineraries/list-itineraries.dto";
import { Inject } from "@nestjs/common";
import { DATABASE_TOKEN } from "@/common/database/database.provider";
import type { Database } from "@/common/database/database";

@QueryHandler(GetTrendingItinerariesQuery)
export class GetTrendingItinerariesQueryHandler implements IQueryHandler<GetTrendingItinerariesQuery> {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async execute(
    query: GetTrendingItinerariesQuery,
  ): Promise<Result<ListItinerariesResponse>> {
    const { limit } = query;

    const itemsResult = await this.db
      .selectFrom("itineraries")
      .select([
        "itineraries.id",
        "itineraries.title",
        "itineraries.slug",
        "itineraries.duration",
        "itineraries.estimated_price_cents",
        "itineraries.currency",
        "itineraries.avg_rating",
        "itineraries.view_count",
        "itineraries.thumbnail_url",
        "itineraries.region",
      ])
      .where("itineraries.status", "=", "published")
      .orderBy("itineraries.view_count", "desc")
      .limit(limit)
      .execute();

    const itineraryIds = itemsResult.map((i) => i.id);
    const tagsResult =
      itineraryIds.length > 0
        ? await this.db
            .selectFrom("itinerary_tags")
            .innerJoin("tags", "tags.id", "itinerary_tags.tag_id")
            .select(["itinerary_tags.itinerary_id", "tags.name"])
            .where("itinerary_tags.itinerary_id", "in", itineraryIds)
            .execute()
        : [];

    const items = itemsResult.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      duration: item.duration || "",
      estimatedPriceCents: item.estimated_price_cents,
      currency: item.currency || "USD",
      avgRating: Number(item.avg_rating),
      viewCount: item.view_count,
      thumbnailUrl: item.thumbnail_url,
      region: item.region,
      tags: tagsResult
        .filter((t) => t.itinerary_id === item.id)
        .map((t) => t.name),
    }));

    return Result.success({
      items,
      total: items.length,
    });
  }
}
