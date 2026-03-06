import { TCell } from './Board.js';
import { TShape, TTetromino } from '../../../events/index.js';

export interface PlayerPort {
  emitBoard(board: TCell[][]): void;
  emitScore(score: number): void;
  emitLevel(level: number): void;
  emitNextPiece(nextPiece: TTetromino, nextPieceShape: TShape): void;
  emitGameEnded(status: 'win' | 'loose'): void;
  emitGameStarted(roomName: string): void;
  emitGameData(data: { player: { id: number; name: string; alive: boolean; score: number } }): void;
  emitSpectrum(playerId: number, spectrum: number[]): void;
  onKeyDown(handlers: Record<string, () => void>): void;
  onKeyUp(handlers: Record<string, () => void>): void;
  offKeyDown(handlers: Record<string, () => void>): void;
  offKeyUp(handlers: Record<string, () => void>): void;
}
