import { Kysely } from 'kysely';
import { DB } from '../generated';
import * as migration012 from './012-create-upload-sessions';
import * as migration013 from './013-alter-activity-images-for-r2-keys';


export interface Migration {
  up(db: Kysely<DB>): Promise<void>;
  down(db: Kysely<DB>): Promise<void>;
}

export const migrations: Record<string, Migration> = {
  '012-create-upload-sessions': migration012,
  '013-alter-activity-images-for-r2-keys': migration013,
};

// Note: Migrations are now executed via Kysely's official Migrator in CLI scripts
// The FileMigrationProvider reads migration files automatically from this directory
