import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        CREATE TYPE user_gender_enum AS ENUM ('male', 'female');
`);

  return await knex.raw(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,                     
    last_name VARCHAR(100) ,         
    first_name VARCHAR(100) NOT NULL,          
    middle_name VARCHAR(100),                  
    gender user_gender_enum,                    
    email VARCHAR(150) UNIQUE ,       
    phone_number VARCHAR(30) UNIQUE NOT NULL,    
    guest_ip inet,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TYPE IF EXISTS user_gender_enum;');
  return knex.raw(`DROP TABLE IF EXISTS users;`);
}
