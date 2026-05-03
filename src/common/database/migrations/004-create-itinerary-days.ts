import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('itinerary_days')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('itinerary_id', 'uuid', (col) => col.references('itineraries.id').onDelete('cascade').notNull())
    .addColumn('day_index', 'integer', (col) => col.notNull())
    .addColumn('theme', 'varchar(200)')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('itinerary_days').execute();
}
