import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('itineraries')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('title', 'varchar(200)', (col) => col.notNull())
    .addColumn('slug', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('description', 'text')
    .addColumn('thumbnail_url', 'varchar(500)')
    .addColumn('status', sql`itinerary_status`, (col) => col.notNull().defaultTo('draft'))
    .addColumn('duration_days', 'integer', (col) => col.notNull())
    .addColumn('is_featured', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('view_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('like_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('published_at', 'timestamp')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('itineraries').execute();
}
