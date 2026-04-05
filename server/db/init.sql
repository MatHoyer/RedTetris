CREATE TABLE IF NOT EXISTS player_high_scores (
  player_name VARCHAR(32) PRIMARY KEY,
  high_score INTEGER NOT NULL DEFAULT 0 CHECK (high_score >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_high_scores_high_score_desc ON player_high_scores (high_score DESC);
