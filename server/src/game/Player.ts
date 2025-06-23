import { Board } from './Board.js';

export class Player {
  id: number;
  name: string;
  socketId: string | null;
  board: Board;
  tickRate: number;
  tickInterval: NodeJS.Timeout | null;
  alive: boolean;

  constructor(id: number, name: string, socketId: string | null) {
    this.socketId = socketId || null;
    this.id = id;
    this.name = name;
    this.board = new Board();
    this.tickRate = 200; // ms
    this.tickInterval = null;
    this.alive = true;
  }

  updatePlayer(name: string) {
    this.name = name;
  }

  start() {
    this.stop();
    this.tickInterval = setInterval(this.tick, this.tickRate);
  }

  tick() {
    if (!this.board.moveCurrPieceDown()) {
      this.alive = false;
      this.stop();
    } else this.board.moveCurrPieceDown();
  }

  stop() {
    if (this.tickInterval) clearInterval(this.tickInterval);
  }

  toPayload() {
    return {
      id: this.id,
      name: this.name,
      alive: this.alive,
      board: this.board.toPayload(),
    };
  }
}
