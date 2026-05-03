import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListItinerariesQuery } from './list-itineraries.query';
import { Result } from '@/common/domain/result';
import { ListItinerariesResponse } from './list-itineraries.dto';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import type { Database } from '@/common/database/database';
import { sql } from 'kysely';

@QueryHandler(ListItinerariesQuery)
export class ListItinerariesQueryHandler implements IQueryHandler<ListItinerariesQuery> {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async execute(query: ListItinerariesQuery): Promise<Result<ListItinerariesResponse>> {
    const { page, limit, region, tag } = query;
    const offset = (page - 1) * limit;

    let baseQuery = this.db
      .selectFrom('itineraries')
      .innerJoin('users', 'users.id', 'itineraries.user_id')
      .where('itineraries.status', '=', 'published');

    if (region) {
      baseQuery = baseQuery.where('itineraries.region', '=', region);
    }

    if (tag) {
      baseQuery = baseQuery.where(({ exists, selectFrom }) => 
        exists(
          selectFrom('itinerary_tags')
            .innerJoin('tags', 'tags.id', 'itinerary_tags.tag_id')
            .whereRef('itinerary_tags.itinerary_id', '=', 'itineraries.id')
            .where('tags.name', '=', tag)
        )
      );
    }

    const itemsResult = await baseQuery
      .select([
        'itineraries.id',
        'itineraries.title',
        'itineraries.slug',
        'itineraries.duration',
        'itineraries.estimated_price_cents',
        'itineraries.currency',
        'itineraries.avg_rating',
        'itineraries.view_count',
        'itineraries.thumbnail_url',
        'itineraries.region',
        'users.display_name as author_display_name',
        'users.avatar_url as author_avatar_url',
      ])
      .orderBy('itineraries.published_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const totalResult = await baseQuery
      .select(sql<number>`count(*)`.as('count'))
      .executeTakeFirst();

    const itineraryIds = itemsResult.map(i => i.id);
    const tagsResult = itineraryIds.length > 0 
      ? await this.db
          .selectFrom('itinerary_tags')
          .innerJoin('tags', 'tags.id', 'itinerary_tags.tag_id')
          .select(['itinerary_tags.itinerary_id', 'tags.name'])
          .where('itinerary_tags.itinerary_id', 'in', itineraryIds)
          .execute()
      : [];

    const items = itemsResult.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      duration: item.duration || '',
      estimatedPriceCents: item.estimated_price_cents,
      currency: item.currency || 'USD',
      avgRating: Number(item.avg_rating),
      viewCount: item.view_count,
      thumbnailUrl: item.thumbnail_url,
      region: item.region,
      author: {
        displayName: item.author_display_name,
        avatarUrl: item.author_avatar_url,
      },
      tags: tagsResult
        .filter(t => t.itinerary_id === item.id)
        .map(t => t.name),
    }));

    return Result.success({
      items,
      total: Number(totalResult?.count ?? 0),
    });
  }
}
