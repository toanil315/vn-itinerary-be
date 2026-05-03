import { ICommand } from '@nestjs/cqrs';

export class CreateBookmarkCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly itineraryId: string
  ) {}
}
