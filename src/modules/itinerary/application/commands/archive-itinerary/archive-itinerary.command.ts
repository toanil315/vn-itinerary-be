import { ICommand } from '@nestjs/cqrs';

export class ArchiveItineraryCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {}
}
