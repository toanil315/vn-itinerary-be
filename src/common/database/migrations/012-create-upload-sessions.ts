import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('upload_sessions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('object_key', 'varchar(500)', (col) => col.notNull().unique())
    .addColumn('bucket', 'varchar(100)', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) => col.notNull())
    .addColumn('content_type', 'varchar(100)', (col) => col.notNull())
    .addColumn('max_size_bytes', 'integer', (col) => col.notNull())
    .addColumn('size_bytes', 'integer')
    .addColumn('expires_at', 'timestamp', (col) => col.notNull())
    .addColumn('uploaded_at', 'timestamp')
    .addColumn('confirmed_at', 'timestamp')
    .addColumn('consumed_at', 'timestamp')
    .addColumn('idempotency_key', 'varchar(120)')
    .addColumn('request_fingerprint', 'varchar(64)')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createIndex('upload_sessions_user_status_idx')
    .on('upload_sessions')
    .columns(['user_id', 'status'])
    .execute();

  await db.schema
    .createIndex('upload_sessions_expires_at_idx')
    .on('upload_sessions')
    .column('expires_at')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('upload_sessions_expires_at_idx').execute();
  await db.schema.dropIndex('upload_sessions_user_status_idx').execute();
  await db.schema.dropTable('upload_sessions').execute();
}

