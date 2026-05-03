import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('tags')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('slug', 'varchar(100)', (col) => col.notNull().unique())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('icon', 'varchar(50)')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable('itinerary_tags')
    .addColumn('itinerary_id', 'uuid', (col) => col.references('itineraries.id').onDelete('cascade').notNull())
    .addColumn('tag_id', 'uuid', (col) => col.references('tags.id').onDelete('cascade').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addPrimaryKeyConstraint('itinerary_tags_pkey', ['itinerary_id', 'tag_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('itinerary_tags').execute();
  await db.schema.dropTable('tags').execute();
}
