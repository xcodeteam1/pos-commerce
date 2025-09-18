import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE IF NOT EXISTS liked (
      id SERIAL PRIMARY KEY,
      guest_id INT NOT NULL REFERENCES guest(id) ON DELETE CASCADE,
      product_barcode VARCHAR(50),                                 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TABLE IF EXISTS liked;
  `);
}
