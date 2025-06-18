import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from './config';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

// Initialize Drizzle with the PostgreSQL connection
export const db = drizzle(pool);
