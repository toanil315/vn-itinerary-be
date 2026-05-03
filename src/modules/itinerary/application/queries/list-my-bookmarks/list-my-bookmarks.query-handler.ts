import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListMyBookmarksQuery } from './list-my-bookmarks.query';
import { Result } from '@/common/domain/result';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import type { Database } from '@/common/database/database';
import { sql } from 'kysely';

@QueryHandler(ListMyBookmarksQuery)
export class ListMyBookmarksQueryHandler implements IQueryHandler<ListMyBookmarksQuery> {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async execute(query: ListMyBookmarksQuery): Promise<Result<any>> {
    const { userId, page, limit } = query;
    const offset = (page - 1) * limit;

    const itemsResult = await this.db
      .selectFrom('bookmarks')
      .innerJoin('itineraries', 'itineraries.id', 'bookmarks.itinerary_id')
      .innerJoin('users', 'users.id', 'itineraries.user_id')
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
      .where('bookmarks.user_id', '=', userId)
      .orderBy('bookmarks.created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const totalResult = await this.db
      .selectFrom('bookmarks')
      .select(sql<number>`count(*)`.as('count'))
      .where('user_id', '=', userId)
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
