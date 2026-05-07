import { Controller, Get } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiResponse } from "@/common/http/swagger.response-decorator";
import { Public } from "@/modules/auth/public";
import { ListTagsQuery } from "../application/queries/list-tags/list-tags.query";
import { ListTagsResponse } from "../application/queries/list-tags/list-tags.dto";

@ApiTags("Tags")
@Controller("v1/tags")
export class TagController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "List All Tags" })
  @ApiResponse({
    description: "Tags list retrieved successfully",
    type: ListTagsResponse,
  })
  @Public()
  @Get()
  async list() {
    return this.queryBus.execute(new ListTagsQuery());
  }
}
