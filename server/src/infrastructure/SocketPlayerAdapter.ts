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

  emitLevel(level: number): void {
    this.socket.emit(Events.UPDATED_LEVEL, { level });
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

  onKeyDown(handlers: Record<string, () => void>): void {
    const eventMap: Record<string, string> = {
      down: Events.KEY_DOWN_PRESS,
      left: Events.KEY_LEFT_PRESS,
      right: Events.KEY_RIGHT_PRESS,
      rotate: Events.KEY_ROTATE_PRESS,
      hardDrop: Events.KEY_HARD_DROP,
    };
    for (const [key, event] of Object.entries(eventMap)) {
      if (handlers[key]) this.socket.on(event, handlers[key]);
    }
  }

  onKeyUp(handlers: Record<string, () => void>): void {
    const eventMap: Record<string, string> = {
      down: Events.KEY_DOWN_RELEASE,
      left: Events.KEY_LEFT_RELEASE,
      right: Events.KEY_RIGHT_RELEASE,
      rotate: Events.KEY_ROTATE_RELEASE,
    };
    for (const [key, event] of Object.entries(eventMap)) {
      if (handlers[key]) this.socket.on(event, handlers[key]);
    }
  }

  offKeyDown(handlers: Record<string, () => void>): void {
    const eventMap: Record<string, string> = {
      down: Events.KEY_DOWN_PRESS,
      left: Events.KEY_LEFT_PRESS,
      right: Events.KEY_RIGHT_PRESS,
      rotate: Events.KEY_ROTATE_PRESS,
      hardDrop: Events.KEY_HARD_DROP,
    };
    for (const [key, event] of Object.entries(eventMap)) {
      if (handlers[key]) this.socket.off(event, handlers[key]);
    }
  }

  offKeyUp(handlers: Record<string, () => void>): void {
    const eventMap: Record<string, string> = {
      down: Events.KEY_DOWN_RELEASE,
      left: Events.KEY_LEFT_RELEASE,
      right: Events.KEY_RIGHT_RELEASE,
      rotate: Events.KEY_ROTATE_RELEASE,
    };
    for (const [key, event] of Object.entries(eventMap)) {
      if (handlers[key]) this.socket.off(event, handlers[key]);
    }
  }
}
