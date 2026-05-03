import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListTagsQuery } from './list-tags.query';
import { Result } from '@/common/domain/result';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import type { Database } from '@/common/database/database';

@QueryHandler(ListTagsQuery)
export class ListTagsQueryHandler implements IQueryHandler<ListTagsQuery> {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async execute(_query: ListTagsQuery): Promise<Result<{ name: string; slug: string }[]>> {
    const tags = await this.db
      .selectFrom('tags')
      .select(['name', 'slug'])
      .orderBy('name', 'asc')
      .execute();

    return Result.success(tags);
  }
}
