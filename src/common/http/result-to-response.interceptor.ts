import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import z from 'zod';
import { ResponseFormatter } from './response.formatter';
import { Response } from 'express';
import { Result } from '../domain/result';
import { ApiSuccess, ApiSuccessSchema } from './response.schema';
import { ErrorType } from '../domain/error';

@Injectable()
export class ResultTransformInterceptor<T> implements NestInterceptor<
  Result<T>,
  ApiSuccess<T> | undefined
> {
  constructor(private readonly schema: z.ZodAny) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccess<T> | undefined> {
    return next
      .handle()
      .pipe(map((result) => this.fromResultToResponse(result, context)));
  }

  private fromResultToResponse(result: Result<T>, context: ExecutionContext) {
    if (!result.isSuccess) {
      const error = result.businessError!;
      const response: Response = context.switchToHttp().getResponse();

      response
        .status(this.fromErrorTypeToStatusCode(error.type))
        .json(
          ResponseFormatter.failure(error.code, error.message, error.details),
        );

      return;
    }

    const { success, data, error } = ApiSuccessSchema(this.schema).safeParse(
      ResponseFormatter.success(result.value),
    );

    if (!success) {
      console.log('Response validation failed:', error.issues);
      throw new InternalServerErrorException('Response validation failed');
    }

    return data;
  }

  private fromErrorTypeToStatusCode(type: ErrorType) {
    switch (type) {
      case ErrorType.Problem: {
        return HttpStatus.BAD_REQUEST;
      }

      case ErrorType.NotFound: {
        return HttpStatus.NOT_FOUND;
      }

      case ErrorType.Conflict: {
        return HttpStatus.CONFLICT;
      }

      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
