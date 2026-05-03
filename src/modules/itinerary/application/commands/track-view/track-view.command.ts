import { ICommand } from '@nestjs/cqrs';

export class TrackViewCommand implements ICommand {
  constructor(
    public readonly itineraryId: string,
    public readonly userId?: string,
    public readonly ipHash?: string,
    public readonly userAgent?: string
  ) {}
}
