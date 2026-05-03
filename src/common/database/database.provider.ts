import { FactoryProvider } from '@nestjs/common';
import { Database, createDatabase } from './database';
import { ConfigService } from '@nestjs/config';

export const DATABASE_TOKEN = 'DATABASE_CONNECTION';

export const DatabaseProvider: FactoryProvider = {
  provide: DATABASE_TOKEN,
  useFactory: (configService: ConfigService): Database => {
    return createDatabase({
      host: configService.getOrThrow<string>('DB_HOST'),
      port: configService.getOrThrow<number>('DB_PORT'),
      user: configService.getOrThrow<string>('DB_USERNAME'),
      password: configService.getOrThrow<string>('DB_PASSWORD'),
      database: configService.getOrThrow<string>('DB_NAME'),
    });
  },
  inject: [ConfigService],
};
