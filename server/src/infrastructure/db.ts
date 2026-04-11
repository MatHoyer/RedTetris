import { Pool } from 'pg';
import logger from '../logger.js';

const log = logger.child({ component: 'DB' });

let pool: Pool | null = null;

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? 'postgresql://redtetris:redtetris@127.0.0.1:5432/redtetris';
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl(), max: 10 });
    pool.on('error', (err) => {
      log.error(err, 'Unexpected PostgreSQL pool error');
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS player_high_scores (
      player_name VARCHAR(32) PRIMARY KEY,
      high_score INTEGER NOT NULL DEFAULT 0 CHECK (high_score >= 0),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await p.query(`
    CREATE INDEX IF NOT EXISTS idx_player_high_scores_high_score_desc
    ON player_high_scores (high_score DESC);
  `);
  log.info('Database schema ready');
}
