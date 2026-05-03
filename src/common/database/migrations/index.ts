import { Kysely } from 'kysely';
import { DB } from '../generated';


export interface Migration {
  up(db: Kysely<DB>): Promise<void>;
  down(db: Kysely<DB>): Promise<void>;
}

export const migrations: Record<string, Migration> = {

};

// Note: Migrations are now executed via Kysely's official Migrator in CLI scripts
// The FileMigrationProvider reads migration files automatically from this directory
