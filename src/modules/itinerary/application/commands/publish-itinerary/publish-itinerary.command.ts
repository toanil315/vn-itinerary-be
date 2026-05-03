import { ICommand } from '@nestjs/cqrs';

export class PublishItineraryCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {}
}
