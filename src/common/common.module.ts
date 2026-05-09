import { Global, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { z } from 'zod';
import { ServerExceptionsFilter } from './exception/server.exception-filter';
import { ValidationExceptionFilter } from './exception/validation.exception-filter';
import { ForbiddenExceptionFilter } from './exception/forbidden.exception-filter';
import { DatabaseProvider } from './database/database.provider';
import { RequestValidationPipe } from './exception/validation.pipe';

const envSchema = z
  .object({
    R2_ACCOUNT_ID: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_UPLOAD_URL_TTL_SECONDS: z.coerce.number().int().min(1).max(300).default(300),
    R2_PUBLIC_BASE_URL: z.string().url().optional(),
    UPLOAD_CLEANUP_INTERVAL_SECONDS: z.coerce.number().int().min(60).default(600),
    UPLOAD_CLEANUP_DELETE_OBJECTS: z.enum(['true', 'false']).default('false'),
  })
  .passthrough();

const exceptionFilterProviders: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: ServerExceptionsFilter,
  },
  {
    provide: APP_FILTER,
    useClass: ValidationExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: ForbiddenExceptionFilter,
  },
];

@Global()
@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
  ],
  providers: [
    DatabaseProvider,
    {
      provide: APP_PIPE,
      useClass: RequestValidationPipe,
    },

    ...exceptionFilterProviders,
  ],
  exports: [DatabaseProvider],
})
export class CommonModule {}
