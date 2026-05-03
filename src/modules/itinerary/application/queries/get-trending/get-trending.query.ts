import { IQuery } from '@nestjs/cqrs';

export class GetTrendingItinerariesQuery implements IQuery {
  constructor(public readonly limit: number = 10) {}
}
