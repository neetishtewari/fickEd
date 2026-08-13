import pg from 'pg';
import pgvector from 'pgvector/pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isPgConnected = false;

pool.on('connect', async (client) => {
  isPgConnected = true;
  try {
    await pgvector.registerType(client);
  } catch (err) {
    // Ignore vector type registration if extension not installed yet
  }
});

pool.on('error', (err) => {
  isPgConnected = false;
});

export function isPostgresAvailable(): boolean {
  return isPgConnected && !env.MOCK_MODE;
}

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`[SLOW QUERY] Executed in ${duration}ms: ${text.substring(0, 80)}...`);
    }
    return res;
  } catch (err) {
    // If PostgreSQL fails to connect or query errors out, log warning and let caller handle
    console.warn(`[DB WARNING] Query fell back or failed: ${(err as Error).message}`);
    throw err;
  }
}
