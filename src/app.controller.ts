import { Controller, Get } from "@nestjs/common";
import { Public } from "@/modules/auth/public";
import { Result } from "@/common/domain/result";
import { ApiResponse } from "@/common/http/swagger.response-decorator";
import { z } from "zod";

import { createZodDto } from "nestjs-zod";

const HealthResponseSchema = z.object({
  status: z.string(),
});

class HealthResponse extends createZodDto(HealthResponseSchema) {}

@Controller()
export class AppController {
  @Public()
  @Get("health")
  @ApiResponse({
    description: "Health check",
    type: HealthResponse,
    statusCode: 200,
  })
  getHealth(): Result<{ status: string }> {
    return Result.success({ status: "ok" });
  }
}
