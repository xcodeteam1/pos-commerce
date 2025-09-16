import * as dotenv from 'dotenv';
import type { Knex } from 'knex';
dotenv.config();

export const db1_config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
  },
  migrations: {
    directory: './migrations',
  },
};

export const db2_config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_MAIN_NAME,
    port: Number(process.env.DB_PORT) || 5432,
  },
};

/**
 * Knex CLI faqat bitta obyektni qabul qiladi,
 * shuning uchun `module.exports` bilan asosiy configni chiqaramiz.
 */
export default db1_config;
