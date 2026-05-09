import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('activity_images')
    .addColumn('object_key', 'varchar(500)')
    .addColumn('content_type', 'varchar(100)')
    .addColumn('size_bytes', 'integer')
    .addColumn('upload_session_id', 'uuid', (col) =>
      col.references('upload_sessions.id').onDelete('set null'),
    )
    .execute();

  await sql`update activity_images set object_key = url where object_key is null`.execute(db);
  await db.schema.alterTable('activity_images').alterColumn('object_key', (col) => col.setNotNull()).execute();
  await db.schema.alterTable('activity_images').dropColumn('url').execute();

  await db.schema
    .createIndex('activity_images_upload_session_idx')
    .on('activity_images')
    .column('upload_session_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('activity_images')
    .addColumn('url', 'varchar(500)')
    .execute();

  await sql`update activity_images set url = object_key where url is null`.execute(db);
  await db.schema.alterTable('activity_images').alterColumn('url', (col) => col.setNotNull()).execute();
  await db.schema.dropIndex('activity_images_upload_session_idx').execute();
  await db.schema
    .alterTable('activity_images')
    .dropColumn('upload_session_id')
    .dropColumn('size_bytes')
    .dropColumn('content_type')
    .dropColumn('object_key')
    .execute();
}

