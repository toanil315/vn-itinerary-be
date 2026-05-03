import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteBookmarkCommand } from './delete-bookmark.command';
import { Result } from '@/common/domain/result';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import type { Database } from '@/common/database/database';

@CommandHandler(DeleteBookmarkCommand)
export class DeleteBookmarkCommandHandler implements ICommandHandler<DeleteBookmarkCommand> {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async execute(command: DeleteBookmarkCommand): Promise<Result<void>> {
    const { userId, itineraryId } = command;

    await this.db
      .deleteFrom('bookmarks')
      .where('user_id', '=', userId)
      .where('itinerary_id', '=', itineraryId)
      .execute();

    return Result.success(undefined);
  }
}
