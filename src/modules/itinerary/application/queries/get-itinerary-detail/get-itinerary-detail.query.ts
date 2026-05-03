import { IQuery } from '@nestjs/cqrs';

export class GetItineraryDetailQuery implements IQuery {
  constructor(public readonly slug: string) {}
}
