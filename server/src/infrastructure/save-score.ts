import { getPool } from './db.js';

const upsertSql = `
  INSERT INTO player_high_scores (player_name, high_score, modes)
  VALUES ($1, $2, $3)
  ON CONFLICT (player_name) DO UPDATE SET
    modes = CASE WHEN EXCLUDED.high_score > player_high_scores.high_score THEN EXCLUDED.modes ELSE player_high_scores.modes END,
    high_score = GREATEST(player_high_scores.high_score, EXCLUDED.high_score),
    updated_at = NOW();
`;

export type HighScoreEntry = {
  playerName: string;
  highScore: number;
  modes: string[];
  updatedAt: string;
};

export async function saveScores(scores: Record<string, number>, modes: string[] = []): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [playerName, score] of Object.entries(scores)) {
      if (!Number.isFinite(score) || score < 0) continue;
      await client.query(upsertSql, [playerName, Math.floor(score), modes]);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function listHighScoresPaginated(
  page: number,
  pageSize: number,
): Promise<{ items: HighScoreEntry[]; total: number }> {
  const pool = getPool();
  const offset = (page - 1) * pageSize;

  const countRes = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM player_high_scores',
  );
  const total = Number(countRes.rows[0]?.count ?? 0);

  const dataRes = await pool.query<{
    player_name: string;
    high_score: number;
    modes: string[];
    updated_at: Date;
  }>(
    `SELECT player_name, high_score, modes, updated_at FROM player_high_scores
     ORDER BY high_score DESC, player_name ASC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset],
  );

  return {
    total,
    items: dataRes.rows.map((r) => ({
      playerName: r.player_name,
      highScore: r.high_score,
      modes: r.modes ?? [],
      updatedAt: r.updated_at.toISOString(),
    })),
  };
}
