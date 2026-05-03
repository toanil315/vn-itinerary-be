import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBookmarkCommand } from './create-bookmark.command';
import { Result } from '@/common/domain/result';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import type { Database } from '@/common/database/database';

@CommandHandler(CreateBookmarkCommand)
export class CreateBookmarkCommandHandler implements ICommandHandler<CreateBookmarkCommand> {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async execute(command: CreateBookmarkCommand): Promise<Result<void>> {
    const { userId, itineraryId } = command;

    await this.db
      .insertInto('bookmarks')
      .values({
        user_id: userId,
        itinerary_id: itineraryId,
      })
      .onConflict((oc) => oc.doNothing())
      .execute();

    return Result.success(undefined);
  }
}
