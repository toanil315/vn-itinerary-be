import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './generated';

interface CreateDatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function createDatabase(config: CreateDatabaseConfig): Kysely<DB> {
  const dialect = new PostgresDialect({
    pool: new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      max: 10,
    }),
  });

  return new Kysely<DB>({
    dialect,
  });
}

export type Database = Kysely<DB>;
