import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { ResultTransformInterceptor } from './result-to-response.interceptor';

export function ApiResponse({
  type,
  description,
}: {
  type: ReturnType<typeof createZodDto>;
  description?: string;
}) {
  return applyDecorators(
    ApiOkResponse({
      description,
      type: type.Output,
    }),
    UseInterceptors(new ResultTransformInterceptor(type.schema as z.ZodAny)),
  );
}
