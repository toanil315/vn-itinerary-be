import * as path from 'path';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { Migrator, FileMigrationProvider, NO_MIGRATIONS } from 'kysely';
import { createDatabase } from '@/common/database/database';

dotenv.config();

async function migrateReset() {
  const db = createDatabase({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
  });

  try {
    const migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, '../common/database/migrations'),
      }),
    });

    console.log('Rolling back all migrations...');
    let { error, results } = await migrator.migrateTo(NO_MIGRATIONS);

    results?.forEach((it) => {
      if (it.status === 'Success') {
        console.log(`✓ ${it.migrationName}`);
      } else if (it.status === 'Error') {
        console.error(`✗ ${it.migrationName}`);
      }
    });

    if (error) {
      console.error('✗ Failed to reset migrations');
      console.error(error);
      process.exit(1);
    }

    console.log('✓ All migrations reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Reset failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

migrateReset();
