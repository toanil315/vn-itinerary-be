import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('activities')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('itinerary_day_id', 'uuid', (col) => col.references('itinerary_days.id').onDelete('cascade').notNull())
    .addColumn('time_session', sql`session_type`, (col) => col.notNull())
    .addColumn('order_index', 'integer', (col) => col.notNull())
    .addColumn('title', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('location_name', 'varchar(200)')
    .addColumn('location_address', 'varchar(500)')
    .addColumn('location_lat', 'numeric(10, 8)')
    .addColumn('location_lng', 'numeric(11, 8)')
    .addColumn('place_id', 'varchar(255)')
    .addColumn('estimated_cost', 'numeric(12, 2)')
    .addColumn('currency', 'varchar(3)', (col) => col.defaultTo('VND'))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('activities').execute();
}
