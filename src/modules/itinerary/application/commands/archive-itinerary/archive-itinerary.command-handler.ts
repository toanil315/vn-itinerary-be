import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArchiveItineraryCommand } from './archive-itinerary.command';
import { ItineraryRepository } from '../../../domain/itinerary.repository';
import { ItineraryErrors } from '../../../domain/itinerary.errors';
import { Result } from '@/common/domain/result';
import { sql } from 'kysely';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import type { Database } from '@/common/database/database';
import { Inject } from '@nestjs/common';

@CommandHandler(ArchiveItineraryCommand)
export class ArchiveItineraryCommandHandler implements ICommandHandler<ArchiveItineraryCommand> {

  constructor(
    private readonly itineraryRepository: ItineraryRepository,
    @Inject(DATABASE_TOKEN) private readonly db: Database
  ) {}

  async execute(command: ArchiveItineraryCommand): Promise<Result<void>> {
    const { id, userId } = command;

    const itinerary = await this.itineraryRepository.findById(id);
    if (!itinerary) {
      return Result.failure(ItineraryErrors.NotFound(id));
    }

    if (!itinerary.isOwner(userId)) {
      return Result.failure(ItineraryErrors.NotOwner());
    }

    await this.db
      .updateTable('itineraries')
      .set({
        status: 'archived',
        updated_at: sql`now()`,
      })
      .where('id', '=', id)
      .execute();

    return Result.success(undefined);
  }
}
