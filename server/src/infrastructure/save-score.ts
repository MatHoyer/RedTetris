import fs from 'fs/promises';
import { join } from 'path';

const SCORE_JSON_FILE = join(process.cwd(), 'score.json');

export const loadScores = async (): Promise<Record<string, number>> => {
  try {
    const raw = await fs.readFile(SCORE_JSON_FILE, 'utf8');
    return JSON.parse(raw) as Record<string, number>;
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err?.code === 'ENOENT') {
      await fs.writeFile(SCORE_JSON_FILE, '{}');
      return {};
    }
    throw e;
  }
};

export const saveScore = async (playerName: string, score: number) => {
  const scores = await loadScores();
  scores[playerName] = Math.max(scores[playerName] ?? 0, score);
  await fs.writeFile(SCORE_JSON_FILE, JSON.stringify(scores, null, 2));
};

export const saveScores = async (scores: Record<string, number>) => {
  const existingScores = await loadScores();
  for (const [playerName, score] of Object.entries(scores)) {
    existingScores[playerName] = Math.max(existingScores[playerName] ?? 0, score);
  }
  await fs.writeFile(SCORE_JSON_FILE, JSON.stringify(existingScores, null, 2));
};
