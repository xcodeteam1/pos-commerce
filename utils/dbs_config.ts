import knex from 'knex';
import { db1_config, db2_config } from '../knexfile';

export const db1 = knex(db1_config);
export const db2 = knex(db2_config);
