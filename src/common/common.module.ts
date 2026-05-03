import { Global, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ServerExceptionsFilter } from './exception/server.exception-filter';
import { ValidationExceptionFilter } from './exception/validation.exception-filter';
import { ForbiddenExceptionFilter } from './exception/forbidden.exception-filter';
import { DatabaseProvider } from './database/database.provider';
import { RequestValidationPipe } from './exception/validation.pipe';

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
