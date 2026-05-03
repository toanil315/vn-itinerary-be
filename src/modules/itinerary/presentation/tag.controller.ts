import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/modules/auth/public';
import { ListTagsQuery } from '../application/queries/list-tags/list-tags.query';

@ApiTags('Tags')
@Controller('v1/tags')
export class TagController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List All Tags' })
  @Public()
  @Get()
  async list() {
    const result = await this.queryBus.execute(new ListTagsQuery());
    return result.unwrap();
  }
}
