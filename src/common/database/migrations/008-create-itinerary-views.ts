import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('itinerary_views')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('itinerary_id', 'uuid', (col) => col.references('itineraries.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('ip_hash', 'varchar(64)')
    .addColumn('user_agent', 'text')
    .addColumn('viewed_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('itinerary_views').execute();
}
