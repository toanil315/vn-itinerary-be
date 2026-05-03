import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('activity_images')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('activity_id', 'uuid', (col) => col.references('activities.id').onDelete('cascade').notNull())
    .addColumn('url', 'varchar(500)', (col) => col.notNull())
    .addColumn('caption', 'varchar(255)')
    .addColumn('display_order', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('activity_images').execute();
}
