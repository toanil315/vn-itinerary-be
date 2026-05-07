import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { ResultTransformInterceptor } from "./result-to-response.interceptor";

export function ApiResponse({
  type,
  description,
  statusCode = 200,
}: {
  type: ReturnType<typeof createZodDto>;
  description?: string;
  statusCode?: number;
}) {
  return applyDecorators(
    SwaggerApiResponse({
      status: statusCode,
      description,
      type: type.Output,
    }),
    UseInterceptors(new ResultTransformInterceptor(type.schema as z.ZodAny)),
  );
}
