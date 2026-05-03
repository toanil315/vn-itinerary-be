import { IQuery } from '@nestjs/cqrs';

export class GetLeaderboardQuery implements IQuery {
  constructor(public readonly limit: number = 20) {}
}
