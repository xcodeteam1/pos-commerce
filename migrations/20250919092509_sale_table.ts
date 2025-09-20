import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE IF NOT EXISTS sale (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_barcode VARCHAR(50) NOT NULL,
      quantity INT DEFAULT 1,
      total_price NUMERIC(12,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`DROP TABLE IF EXISTS sale;`);
}
