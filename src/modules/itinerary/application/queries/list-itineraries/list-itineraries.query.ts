import { IQuery } from '@nestjs/cqrs';

export class ListItinerariesQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly region?: string,
    public readonly tag?: string
  ) {}
}
