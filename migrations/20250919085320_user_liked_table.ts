import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return await knex.raw(`
        CREATE TABLE IF NOT EXISTS user_liked (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_barcode VARCHAR(50),      
            is_order BOOLEAN DEFAULT false,                   
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE IF EXISTS user_liked;`);
}
