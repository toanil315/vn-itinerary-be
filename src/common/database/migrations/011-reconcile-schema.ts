import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Update itineraries
  await db.schema
    .alterTable('itineraries')
    .addColumn('region', 'varchar(50)')
    .addColumn('duration', 'varchar(50)')
    .addColumn('estimated_price_cents', 'integer')
    .addColumn('currency', 'varchar(3)', (col) => col.defaultTo('USD'))
    .addColumn('avg_rating', 'numeric(2, 1)', (col) => col.defaultTo(0.0))
    .execute();

  // Set default region for existing rows if any
  // But since it's fresh, we can just make it not null later or now
  await db.schema
    .alterTable('itineraries')
    .alterColumn('region', (col) => col.setNotNull())
    .execute();

  // Update activities
  await db.schema
    .alterTable('activities')
    .addColumn('cost_display', 'varchar(100)')
    .addColumn('map_link', 'text')
    .addColumn('category_tag', 'varchar(50)')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('itineraries')
    .dropColumn('region')
    .dropColumn('duration')
    .dropColumn('estimated_price_cents')
    .dropColumn('currency')
    .dropColumn('avg_rating')
    .execute();

  await db.schema
    .alterTable('activities')
    .dropColumn('cost_display')
    .dropColumn('map_link')
    .dropColumn('category_tag')
    .execute();
}
