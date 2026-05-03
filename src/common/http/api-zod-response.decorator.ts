import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ResultTransformInterceptor } from './result-to-response.interceptor';

/**
 * API Zod Response Decorator
 *
 * Combines Swagger documentation with Zod validation and Result transformation
 *
 * Usage:
 * @ApiZodResponse({
 *   description: 'Vehicle created successfully',
 *   type: CreateVehicleResponseDto,
 *   statusCode: 201,
 * })
 */
export function ApiZodResponse({
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
