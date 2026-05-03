import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ForbiddenException } from './forbidden.exception';
import { ResponseFormatter } from '../http/response.formatter';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response
      .status(HttpStatus.FORBIDDEN)
      .json(
        ResponseFormatter.failure(
          ForbiddenException.code,
          exception.message,
          exception.details,
        ),
      );
  }
}
