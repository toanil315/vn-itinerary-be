import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PublishItineraryCommand } from './publish-itinerary.command';
import { ItineraryRepository } from '../../../domain/itinerary.repository';
import { ItineraryErrors } from '../../../domain/itinerary.errors';
import { Result } from '@/common/domain/result';
import { sql } from 'kysely';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import type { Database } from '@/common/database/database';
import { Inject } from '@nestjs/common';

@CommandHandler(PublishItineraryCommand)
export class PublishItineraryCommandHandler implements ICommandHandler<PublishItineraryCommand> {

  constructor(
    private readonly itineraryRepository: ItineraryRepository,
    @Inject(DATABASE_TOKEN) private readonly db: Database
  ) {}

  async execute(command: PublishItineraryCommand): Promise<Result<void>> {
    const { id, userId } = command;

    const itinerary = await this.itineraryRepository.getFullItinerary(id);
    if (!itinerary) {
      return Result.failure(ItineraryErrors.NotFound(id));
    }

    if (!itinerary.isOwner(userId)) {
      return Result.failure(ItineraryErrors.NotOwner());
    }

    if (itinerary.status === 'published') {
      return Result.failure(ItineraryErrors.AlreadyPublished());
    }

    if (!itinerary.canPublish()) {
      return Result.failure(ItineraryErrors.CannotPublish('Itinerary must have at least one day and at least one activity'));
    }

    // Update status
    await this.db
      .updateTable('itineraries')
      .set({
        status: 'published',
        published_at: sql`now()`,
        updated_at: sql`now()`,
      })
      .where('id', '=', id)
      .execute();

    return Result.success(undefined);
  }
}
