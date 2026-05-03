import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
  await sql`CREATE TYPE itinerary_status AS ENUM ('draft', 'published', 'archived')`.execute(db);
  await sql`CREATE TYPE session_type AS ENUM ('morning', 'lunch', 'afternoon', 'evening')`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TYPE session_type`.execute(db);
  await sql`DROP TYPE itinerary_status`.execute(db);
  await sql`DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);
}
