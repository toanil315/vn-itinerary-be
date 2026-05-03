import { Inject, Injectable } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { DB } from '@/common/database/generated';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import { ItineraryRepository } from '../domain/itinerary.repository';
import { Itinerary, ItineraryStatus } from '../domain/itinerary.entity';
import { ItineraryDay } from '../domain/day.entity';
import { Activity, SessionType } from '../domain/activity.entity';
import slugify from 'slugify';

@Injectable()
export class ItineraryRepositoryImpl implements ItineraryRepository {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: Kysely<DB>,
  ) {}

  private mapToEntity(itinerary: any, days: any[] = [], activities: any[] = [], tags: any[] = []): Itinerary {
    return Itinerary.create({
      id: itinerary.id,
      userId: itinerary.user_id,
      title: itinerary.title,
      slug: itinerary.slug,
      description: itinerary.description,
      region: itinerary.region,
      duration: itinerary.duration,
      durationDays: itinerary.duration_days,
      thumbnailUrl: itinerary.thumbnail_url,
      status: itinerary.status as ItineraryStatus,
      estimatedPriceCents: itinerary.estimated_price_cents,
      currency: itinerary.currency,
      avgRating: Number(itinerary.avg_rating),
      viewCount: itinerary.view_count,
      likeCount: itinerary.like_count,
      createdAt: itinerary.created_at,
      updatedAt: itinerary.updated_at,
      publishedAt: itinerary.published_at,
      tags: tags.map(t => t.name),
      days: days.map(day => ItineraryDay.create({
        id: day.id,
        itineraryId: day.itinerary_id,
        dayNumber: day.day_number,
        theme: day.theme,
        orderIndex: day.order_index,
        activities: activities
          .filter(a => a.itinerary_day_id === day.id)
          .map(a => Activity.create({
            id: a.id,
            dayId: a.itinerary_day_id,
            title: a.title,
            description: a.description,
            sessionType: a.time_session as SessionType,
            orderIndex: a.order_index,
            locationName: a.location_name,
            locationAddress: a.location_address,
            locationLat: Number(a.location_lat),
            locationLng: Number(a.location_lng),
            estimatedCost: Number(a.estimated_cost),
            currency: a.currency,
            costDisplay: a.cost_display,
            mapLink: a.map_link,
            categoryTag: a.category_tag,
          }))
      }))
    });
  }

  async findById(id: string): Promise<Itinerary | null> {
    const result = await this.db
      .selectFrom('itineraries')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findBySlug(slug: string): Promise<Itinerary | null> {
    const result = await this.db
      .selectFrom('itineraries')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async create(data: any): Promise<{ id: string; slug: string }> {
    return await this.db.transaction().execute(async (trx) => {
      const baseSlug = slugify(data.title, { lower: true, strict: true });
      const uniqueSuffix = Math.random().toString(36).substring(2, 7);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      const itinerary = await trx
        .insertInto('itineraries')
        .values({
          user_id: data.userId,
          title: data.title,
          slug,
          description: data.description,
          region: data.region,
          duration: data.duration,
          duration_days: data.duration_days,
          thumbnail_url: data.thumbnail_url,
          estimated_price_cents: data.estimated_price_cents,
          currency: data.currency || 'USD',
          status: 'draft',
        })
        .returning(['id', 'slug'])
        .executeTakeFirstOrThrow();

      for (const day of data.days) {
        const dayRecord = await trx
          .insertInto('itinerary_days')
          .values({
            itinerary_id: itinerary.id,
            day_index: day.day_number,
            theme: day.theme,
          })
          .returning('id')
          .executeTakeFirstOrThrow();

        if (day.activities && day.activities.length > 0) {
          await trx
            .insertInto('activities')
            .values(
              day.activities.map((activity: any) => ({
                itinerary_day_id: dayRecord.id,
                time_session: activity.time_session,
                order_index: activity.order_index,
                title: activity.title,
                description: activity.description,
                location_name: activity.location_name,
                location_address: activity.location_address,
                location_lat: activity.location_lat,
                location_lng: activity.location_lng,
                estimated_cost: activity.estimated_cost,
                currency: activity.currency || 'VND',
                cost_display: activity.cost_display,
                map_link: activity.map_link,
                category_tag: activity.category_tag,
              }))
            )
            .execute();
        }
      }

      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          let tag = await trx
            .selectFrom('tags')
            .select('id')
            .where('name', '=', tagName)
            .executeTakeFirst();

          if (!tag) {
            const tagSlug = slugify(tagName, { lower: true, strict: true });
            tag = await trx
              .insertInto('tags')
              .values({ name: tagName, slug: tagSlug })
              .returning('id')
              .executeTakeFirstOrThrow();
          }

          await trx
            .insertInto('itinerary_tags')
            .values({
              itinerary_id: itinerary.id,
              tag_id: tag.id,
            })
            .onConflict((oc) => oc.doNothing())
            .execute();
        }
      }

      return { id: itinerary.id, slug: itinerary.slug };
    });
  }

  async update(id: string, data: any): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      await trx
        .updateTable('itineraries')
        .set({
          title: data.title,
          description: data.description,
          region: data.region,
          duration: data.duration,
          duration_days: data.duration_days,
          thumbnail_url: data.thumbnail_url,
          estimated_price_cents: data.estimated_price_cents,
          currency: data.currency,
          updated_at: sql`now()`,
        })
        .where('id', '=', id)
        .execute();
      
      const dayIds = await trx
        .selectFrom('itinerary_days')
        .select('id')
        .where('itinerary_id', '=', id)
        .execute();

      if (dayIds.length > 0) {
        await trx
          .deleteFrom('activities')
          .where('itinerary_day_id', 'in', dayIds.map(d => d.id))
          .execute();
      }

      await trx
        .deleteFrom('itinerary_days')
        .where('itinerary_id', '=', id)
        .execute();

      for (const day of data.days) {
        const dayRecord = await trx
          .insertInto('itinerary_days')
          .values({
            itinerary_id: id,
            day_index: day.day_number,
            theme: day.theme,
          })
          .returning('id')
          .executeTakeFirstOrThrow();

        if (day.activities && day.activities.length > 0) {
          await trx
            .insertInto('activities')
            .values(
              day.activities.map((activity: any) => ({
                itinerary_day_id: dayRecord.id,
                time_session: activity.time_session,
                order_index: activity.order_index,
                title: activity.title,
                description: activity.description,
                location_name: activity.location_name,
                location_address: activity.location_address,
                location_lat: activity.location_lat,
                location_lng: activity.location_lng,
                estimated_cost: activity.estimated_cost,
                currency: activity.currency || 'VND',
                cost_display: activity.cost_display,
                map_link: activity.map_link,
                category_tag: activity.category_tag,
              }))
            )
            .execute();
        }
      }

      await trx
        .deleteFrom('itinerary_tags')
        .where('itinerary_id', '=', id)
        .execute();

      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          let tag = await trx
            .selectFrom('tags')
            .select('id')
            .where('name', '=', tagName)
            .executeTakeFirst();

          if (!tag) {
            const tagSlug = slugify(tagName, { lower: true, strict: true });
            tag = await trx
              .insertInto('tags')
              .values({ name: tagName, slug: tagSlug })
              .returning('id')
              .executeTakeFirstOrThrow();
          }

          await trx
            .insertInto('itinerary_tags')
            .values({
              itinerary_id: id,
              tag_id: tag.id,
            })
            .execute();
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('itineraries')
      .where('id', '=', id)
      .execute();
  }

  async listByAuthor(authorId: string, limit: number, offset: number): Promise<Itinerary[]> {
    const results = await this.db
      .selectFrom('itineraries')
      .selectAll()
      .where('user_id', '=', authorId)
      .orderBy('updated_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    return results.map(r => this.mapToEntity(r));
  }

  async countByAuthor(authorId: string): Promise<number> {
    const result = await this.db
      .selectFrom('itineraries')
      .select(sql<number>`count(*)`.as('count'))
      .where('user_id', '=', authorId)
      .executeTakeFirstOrThrow();

    return Number(result.count);
  }

  async getFullItinerary(id: string): Promise<Itinerary | null> {
    const itinerary = await this.db
      .selectFrom('itineraries')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!itinerary) return null;

    const days = await this.db
      .selectFrom('itinerary_days')
      .selectAll()
      .where('itinerary_id', '=', id)
      .orderBy('day_index', 'asc')
      .execute();

    const dayIds = days.map(d => d.id);
    const activities = dayIds.length > 0 
      ? await this.db
          .selectFrom('activities')
          .selectAll()
          .where('itinerary_day_id', 'in', dayIds)
          .orderBy('order_index', 'asc')
          .execute()
      : [];

    const tags = await this.db
      .selectFrom('itinerary_tags')
      .innerJoin('tags', 'tags.id', 'itinerary_tags.tag_id')
      .select(['tags.name', 'tags.slug'])
      .where('itinerary_id', '=', id)
      .execute();

    return this.mapToEntity(itinerary, days, activities, tags);
  }
}
