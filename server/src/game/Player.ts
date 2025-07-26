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
  score: number;
  handleKeys: Record<string, () => void> | null;

  constructor(id: number, name: string, socketId: string | null, socket?: Socket) {
    this.socketId = socketId || null;
    this.socket = socket || null;
    this.id = id;
    this.name = name;
    this.board = new Board();
    this.tickRate = 800; // ms
    this.tickInterval = null;
    this.alive = true;
    this.score = 0;
    this.handleKeys = null;
  }

  updatePlayer(name: string) {
    this.name = name;
  }

  updateScore(addScore: number) {
    this.score += addScore;
  }

  start() {
    this.stop();
    if (!this.socket) return;

    this.score = 0;
    this.board = new Board(this.updateScore.bind(this));
    this.board.randomNewPiece();
    this.sendBoard();

    const handleKeysWrapper = (keyFn: () => void) => {
      keyFn();
      this.sendBoard();
    };

    this.handleKeys = {
      ' ': () => handleKeysWrapper(() => this.board.hardMoveDown()),
      ArrowUp: () => handleKeysWrapper(() => this.board.rotateCurrPiece()),
      ArrowDown: () => handleKeysWrapper(() => this.board.moveCurrPieceDown()),
      ArrowLeft: () => handleKeysWrapper(() => this.board.moveHorizontal('left')),
      ArrowRight: () => handleKeysWrapper(() => this.board.moveHorizontal('right')),
    };

    for (const [key, fn] of Object.entries(this.handleKeys)) {
      this.socket.on(key, fn);
    }

    this.alive = true;
    this.tickInterval = setInterval(() => this.tick(), this.tickRate);
  }

  tick() {
    const pieceUnlocked = this.board.moveCurrPieceDown();
    if (!pieceUnlocked) {
      if (!this.board.randomNewPiece()) {
        this.alive = false;
        this.stop();
      }
    }
    this.sendBoard();
    this.sendScore();
  }

  stop() {
    if (!this.socket || !this.handleKeys) return;

    for (const [key, fn] of Object.entries(this.handleKeys)) {
      this.socket.off(key, fn);
    }
    if (this.tickInterval) clearInterval(this.tickInterval);

    this.socket.emit(Events.GAME_ENDED, { status: 'loose' });
  }

  sendBoard() {
    this.socket?.emit(Events.UPDATED_BOARD, { board: this.board.grid });
  }

  sendScore() {
    this.socket?.emit(Events.UPDATED_SCORE, { score: this.score });
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
