import { ICommand } from '@nestjs/cqrs';

export class DeleteBookmarkCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly itineraryId: string
  ) {}
}
