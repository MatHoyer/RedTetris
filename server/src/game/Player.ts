import { Socket } from 'socket.io';
import { Events } from '../../../events/index.js';
import { Board } from './Board.js';

export class Player {
  id: number;
  name: string;
  socketId: string | null;
  socket: Socket | null;
  board: Board;
  tickRate: number;
  tickInterval: NodeJS.Timeout | null;
  alive: boolean;

  constructor(id: number, name: string, socketId: string | null, socket?: Socket) {
    this.socketId = socketId || null;
    this.socket = socket || null;
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
    console.log('start');
    this.stop();
    this.alive = true;
    this.tickInterval = setInterval(() => this.tick(), this.tickRate);
  }

  tick() {
    console.log('tick', this.board);
    this.board.moveCurrPieceDown();
    this.socket?.emit(Events.UPDATED_BOARD, { board: this.board.grid });
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
