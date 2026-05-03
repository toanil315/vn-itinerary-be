import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from './validation.exception';
import { BusinessError } from '../domain/error';
import { ServerException } from './server.exception';
import { ForbiddenException } from './forbidden.exception';

@Catch()
export class ServerExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof BusinessError) {
      throw exception;
    }

    if (exception instanceof ValidationException) {
      throw exception;
    }

    if (exception instanceof ForbiddenException) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        success: false,
        error: {
          code: 'VB_HTTP_ERROR',
          message: exception.message,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (exception instanceof ServerException) {
      response.status(500).json({
        success: false,
        message: exception.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        details: exception.details,
      });

      return;
    }

    response.status(500).json({
      success: false,
      message: (exception as any).message || 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
