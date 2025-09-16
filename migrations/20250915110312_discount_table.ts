import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
        CREATE TABLE IF NOT EXISTS discount(
        id SERIAL PRIMARY KEY,
        product_barcode VARCHAR(50),
        discount_price NUMERIC(15,2),
        old_price NUMERIC(15,2),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE IF EXISTS discount;
        `);
}
