import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetItineraryDetailQuery } from "./get-itinerary-detail.query";
import { Result } from "@/common/domain/result";
import { ItineraryDetailResponse } from "./get-itinerary-detail.dto";
import { Inject } from "@nestjs/common";
import { DATABASE_TOKEN } from "@/common/database/database.provider";
import type { Database } from "@/common/database/database";
import { ItineraryErrors } from "../../../domain/itinerary.errors";
import { ConfigService } from "@nestjs/config";

@QueryHandler(GetItineraryDetailQuery)
export class GetItineraryDetailQueryHandler implements IQueryHandler<GetItineraryDetailQuery> {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    query: GetItineraryDetailQuery,
  ): Promise<Result<ItineraryDetailResponse>> {
    const { slug } = query;

    const itinerary = await this.db
      .selectFrom("itineraries")
      .select([
        "itineraries.id",
        "itineraries.title",
        "itineraries.slug",
        "itineraries.description",
        "itineraries.region",
        "itineraries.duration",
        "itineraries.thumbnail_url",
        "itineraries.estimated_price_cents",
        "itineraries.currency",
        "itineraries.avg_rating",
        "itineraries.view_count",
        "itineraries.like_count",
        "itineraries.created_at",
      ])
      .where("itineraries.slug", "=", slug)
      .where("itineraries.status", "=", "published")
      .executeTakeFirst();

    if (!itinerary) {
      return Result.failure(ItineraryErrors.NotFound(slug));
    }

    const days = await this.db
      .selectFrom("itinerary_days")
      .selectAll()
      .where("itinerary_id", "=", itinerary.id)
      .orderBy("day_index", "asc")
      .execute();

    const dayIds = days.map((d) => d.id);
    const activities =
      dayIds.length > 0
        ? await this.db
            .selectFrom("activities")
            .selectAll()
            .where("itinerary_day_id", "in", dayIds)
            .orderBy("order_index", "asc")
            .execute()
        : [];
    const activityIds = activities.map((activity) => activity.id);
    const activityImages =
      activityIds.length > 0
        ? await this.db
            .selectFrom("activity_images")
            .selectAll()
            .where("activity_id", "in", activityIds)
            .orderBy("display_order", "asc")
            .execute()
        : [];

    const tags = await this.db
      .selectFrom("itinerary_tags")
      .innerJoin("tags", "tags.id", "itinerary_tags.tag_id")
      .select("tags.name")
      .where("itinerary_id", "=", itinerary.id)
      .execute();

    return Result.success({
      id: itinerary.id,
      title: itinerary.title,
      slug: itinerary.slug,
      description: itinerary.description,
      region: itinerary.region,
      duration: itinerary.duration || "",
      thumbnailUrl: itinerary.thumbnail_url,
      estimatedPriceCents: itinerary.estimated_price_cents,
      currency: itinerary.currency || "USD",
      avgRating: Number(itinerary.avg_rating),
      viewCount: itinerary.view_count,
      likeCount: itinerary.like_count,
      createdAt: itinerary.created_at.toISOString(),
      tags: tags.map((t) => t.name),

      days: days.map((day) => ({
        id: day.id,
        dayNumber: day.day_index,
        theme: day.theme,
        activities: activities
          .filter((a) => a.itinerary_day_id === day.id)
          .map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            sessionType: a.time_session,
            orderIndex: a.order_index,
            locationName: a.location_name,
            locationAddress: a.location_address,
            estimatedCost: Number(a.estimated_cost),
            currency: a.currency || "VND",
            costDisplay: a.cost_display,
            mapLink: a.map_link,
            categoryTag: a.category_tag,
            images: activityImages
              .filter((image) => image.activity_id === a.id)
              .map((image) => ({
                id: image.id,
                objectKey: (image as any).object_key,
                url: this.toImageUrl((image as any).object_key),
                caption: image.caption,
                displayOrder: image.display_order,
              })),
          })),
      })),
    });
  }

  private toImageUrl(objectKey: string): string | null {
    const publicBaseUrl = this.configService.get<string>("R2_PUBLIC_BASE_URL");
    if (!publicBaseUrl) {
      return null;
    }

    return `${publicBaseUrl.replace(/\/$/, "")}/${objectKey}`;
  }
}
