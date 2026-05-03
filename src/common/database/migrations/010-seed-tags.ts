import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  const tags = [
    { slug: 'culture', name: 'Culture', icon: 'mosque' },
    { slug: 'food', name: 'Food', icon: 'utensils' },
    { slug: 'nature', name: 'Nature', icon: 'tree' },
    { slug: 'adventure', name: 'Adventure', icon: 'mountain' },
    { slug: 'relax', name: 'Relax', icon: 'umbrella-beach' },
    { slug: 'history', name: 'History', icon: 'landmark' },
  ];

  await db.insertInto('tags').values(tags).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('tags').where('slug', 'in', ['culture', 'food', 'nature', 'adventure', 'relax', 'history']).execute();
}
