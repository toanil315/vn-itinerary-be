import { Inject, Injectable } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import slugify from 'slugify';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import { DB } from '@/common/database/generated';
import { BusinessError } from '@/common/domain/error';
import { ItineraryRepository } from '../domain/itinerary.repository';
import { Itinerary, ItineraryStatus } from '../domain/itinerary.entity';
import { ItineraryDay } from '../domain/day.entity';
import { Activity, ActivityImage, SessionType } from '../domain/activity.entity';

@Injectable()
export class ItineraryRepositoryImpl implements ItineraryRepository {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: Kysely<DB>,
  ) {}

  private mapToEntity(
    itinerary: any,
    days: any[] = [],
    activities: any[] = [],
    tags: any[] = [],
    activityImages: any[] = [],
  ): Itinerary {
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
      tags: tags.map((tag) => tag.name),
      days: days.map((day) =>
        ItineraryDay.create({
          id: day.id,
          itineraryId: day.itinerary_id,
          dayNumber: day.day_index,
          theme: day.theme,
          orderIndex: day.day_index,
          activities: activities
            .filter((activity) => activity.itinerary_day_id === day.id)
            .map((activity) =>
              Activity.create({
                id: activity.id,
                dayId: activity.itinerary_day_id,
                title: activity.title,
                description: activity.description,
                sessionType: activity.time_session as SessionType,
                orderIndex: activity.order_index,
                locationName: activity.location_name,
                locationAddress: activity.location_address,
                locationLat: Number(activity.location_lat),
                locationLng: Number(activity.location_lng),
                estimatedCost: Number(activity.estimated_cost),
                currency: activity.currency,
                costDisplay: activity.cost_display,
                mapLink: activity.map_link,
                categoryTag: activity.category_tag,
                images: activityImages
                  .filter((image) => image.activity_id === activity.id)
                  .map((image) =>
                    ActivityImage.create({
                      id: image.id,
                      objectKey: image.object_key,
                      caption: image.caption,
                      displayOrder: image.display_order,
                    }),
                  ),
              }),
            ),
        }),
      ),
    });
  }

  async findById(id: string): Promise<Itinerary | null> {
    const result = await this.db
      .selectFrom('itineraries')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async findBySlug(slug: string): Promise<Itinerary | null> {
    const result = await this.db
      .selectFrom('itineraries')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async create(data: any): Promise<{ id: string; slug: string }> {
    return this.db.transaction().execute(async (trx) => {
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
          status: 'published',
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

        for (const activity of day.activities ?? []) {
          const activityRecord = await trx
            .insertInto('activities')
            .values({
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
            })
            .returning('id')
            .executeTakeFirstOrThrow();

          await this.attachActivityImages(
            trx as unknown as Kysely<any>,
            data.userId,
            activityRecord.id,
            activity.images,
          );
        }
      }

      if (data.tags?.length) {
        for (const tagName of data.tags) {
          const tagSlug = slugify(tagName, { lower: true, strict: true });

          let tag = await trx
            .selectFrom('tags')
            .select('id')
            .where('slug', '=', tagSlug)
            .executeTakeFirst();

          if (!tag) {
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
          .where(
            'itinerary_day_id',
            'in',
            dayIds.map((day) => day.id),
          )
          .execute();
      }

      await trx.deleteFrom('itinerary_days').where('itinerary_id', '=', id).execute();

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

        for (const activity of day.activities ?? []) {
          const activityRecord = await trx
            .insertInto('activities')
            .values({
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
            })
            .returning('id')
            .executeTakeFirstOrThrow();

          await this.attachActivityImages(
            trx as unknown as Kysely<any>,
            data.userId,
            activityRecord.id,
            activity.images,
          );
        }
      }

      await trx.deleteFrom('itinerary_tags').where('itinerary_id', '=', id).execute();

      if (data.tags?.length) {
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
    await this.db.deleteFrom('itineraries').where('id', '=', id).execute();
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

    return results.map((result) => this.mapToEntity(result));
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

    if (!itinerary) {
      return null;
    }

    const days = await this.db
      .selectFrom('itinerary_days')
      .selectAll()
      .where('itinerary_id', '=', id)
      .orderBy('day_index', 'asc')
      .execute();

    const dayIds = days.map((day) => day.id);
    const activities =
      dayIds.length > 0
        ? await this.db
            .selectFrom('activities')
            .selectAll()
            .where('itinerary_day_id', 'in', dayIds)
            .orderBy('order_index', 'asc')
            .execute()
        : [];

    const activityIds = activities.map((activity) => activity.id);
    const activityImages =
      activityIds.length > 0
        ? await (this.db as unknown as Kysely<any>)
            .selectFrom('activity_images')
            .selectAll()
            .where('activity_id', 'in', activityIds)
            .orderBy('display_order', 'asc')
            .execute()
        : [];

    const tags = await this.db
      .selectFrom('itinerary_tags')
      .innerJoin('tags', 'tags.id', 'itinerary_tags.tag_id')
      .select(['tags.name', 'tags.slug'])
      .where('itinerary_id', '=', id)
      .execute();

    return this.mapToEntity(itinerary, days, activities, tags, activityImages);
  }

  private async attachActivityImages(
    trx: Kysely<any>,
    userId: string,
    activityId: string,
    images?: Array<{
      upload_id: string;
      caption?: string;
      display_order: number;
    }>,
  ): Promise<void> {
    if (!images || images.length === 0) {
      return;
    }

    const uploadIds = images.map((image) => image.upload_id);
    if (new Set(uploadIds).size !== uploadIds.length) {
      throw BusinessError.Problem(
        'UPLOAD.DUPLICATE_REFERENCE',
        'Each upload_id can be used once in itinerary payload.',
      );
    }

    const uploadSessions = await trx
      .selectFrom('upload_sessions')
      .selectAll()
      .where('id', 'in', uploadIds)
      .where('user_id', '=', userId)
      .where('status', '=', 'confirmed')
      .where('consumed_at', 'is', null)
      .forUpdate()
      .execute();

    if (uploadSessions.length !== uploadIds.length) {
      throw BusinessError.Problem(
        'UPLOAD.INVALID_REFERENCE',
        'One or more upload sessions are invalid or not confirmed.',
      );
    }

    const now = new Date();
    const sessionById = new Map(uploadSessions.map((session) => [session.id, session]));

    for (const image of images) {
      const session = sessionById.get(image.upload_id);
      if (!session || session.expires_at < now) {
        throw BusinessError.Problem(
          'UPLOAD.EXPIRED_REFERENCE',
          `Upload ${image.upload_id} is expired and cannot be attached.`,
        );
      }

      await trx
        .insertInto('activity_images')
        .values({
          activity_id: activityId,
          object_key: session.object_key,
          content_type: session.content_type,
          size_bytes: session.size_bytes ?? session.max_size_bytes,
          upload_session_id: session.id,
          caption: image.caption ?? null,
          display_order: image.display_order,
        })
        .execute();
    }

    await trx
      .updateTable('upload_sessions')
      .set({
        consumed_at: now,
        updated_at: sql`now()`,
      })
      .where('id', 'in', uploadIds)
      .execute();
  }
}
