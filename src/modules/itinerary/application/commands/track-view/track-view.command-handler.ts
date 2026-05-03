import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TrackViewCommand } from './track-view.command';
import { Result } from '@/common/domain/result';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import type { Database } from '@/common/database/database';
import { sql } from 'kysely';

@CommandHandler(TrackViewCommand)
export class TrackViewCommandHandler implements ICommandHandler<TrackViewCommand> {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async execute(command: TrackViewCommand): Promise<Result<void>> {
    const { itineraryId, userId, ipHash, userAgent } = command;

    // Check for existing view in the last 24 hours
    const existingView = await this.db
      .selectFrom('itinerary_views')
      .select('id')
      .where('itinerary_id', '=', itineraryId)
      .where((eb) => {
        const conditions = [];
        if (userId) conditions.push(eb('user_id', '=', userId));
        if (ipHash) conditions.push(eb('ip_hash', '=', ipHash));
        return eb.or(conditions);
      })
      .where('viewed_at', '>', sql<Date>`now() - interval '24 hours'`)
      .executeTakeFirst();

    if (existingView) {
      return Result.success(undefined);
    }

    // Record view and increment count
    await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('itinerary_views')
        .values({
          itinerary_id: itineraryId,
          user_id: userId,
          ip_hash: ipHash,
          user_agent: userAgent,
        })
        .execute();

      await trx
        .updateTable('itineraries')
        .set({
          view_count: sql`view_count + 1`,
        })
        .where('id', '=', itineraryId)
        .execute();
    });

    return Result.success(undefined);
  }
}
