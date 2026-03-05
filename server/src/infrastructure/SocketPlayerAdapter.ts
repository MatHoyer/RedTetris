import { Socket } from 'socket.io';
import { Events, TShape, TTetromino } from '../../../events/index.js';
import { PlayerPort } from '../domain/ports.js';
import { TCell } from '../domain/Board.js';

export class SocketPlayerAdapter implements PlayerPort {
  constructor(private readonly socket: Socket) {}

  emitBoard(board: TCell[][]): void {
    this.socket.emit(Events.UPDATED_BOARD, { board });
  }

  emitScore(score: number): void {
    this.socket.emit(Events.UPDATED_SCORE, { score });
  }

  emitNextPiece(nextPiece: TTetromino, nextPieceShape: TShape): void {
    this.socket.emit(Events.UPDATED_NEXT_PIECE, { nextPiece, nextPieceShape });
  }

  emitGameEnded(status: 'win' | 'loose'): void {
    this.socket.emit(Events.GAME_ENDED, { status });
  }

  emitGameStarted(roomName: string): void {
    this.socket.emit(Events.GAME_STARTED, { roomName });
  }

  emitGameData(data: { player: { id: number; name: string; alive: boolean; score: number } }): void {
    this.socket.emit(Events.UPDATED_GAME_DATA, data);
  }

  emitSpectrum(playerId: number, spectrum: number[]): void {
    this.socket.emit(Events.UPDATED_SPECTRUM, { playerId, spectrum });
  }

  onKeyInput(handlers: Record<string, () => void>): void {
    for (const [key, fn] of Object.entries(handlers)) {
      this.socket.on(key, fn);
    }
  }

  offKeyInput(handlers: Record<string, () => void>): void {
    for (const [key, fn] of Object.entries(handlers)) {
      this.socket.off(key, fn);
    }
  }
}
