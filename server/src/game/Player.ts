import { Socket } from 'socket.io';
import { Events } from '../../../events/index.js';
import { Board } from './Board.js';
import { Tetrominos } from './Tetrominos.js';
import { Shapes } from './shapes.js';

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
  bag: Tetrominos;
  bagIndex: number;
  notify: (data: { id: number; name: string; alive: boolean }) => void;
  onStop: () => void;

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
    this.bag = new Tetrominos();
    this.bagIndex = 0;
    this.notify = () => {};
    this.onStop = () => {};
  }

  updatePlayer(name: string) {
    this.name = name;
  }

  updateScore(addScore: number) {
    this.score += addScore;
  }

  handleNextPiece() {
    const { current, next } = this.bag.getPiece(this.bagIndex);
    this.socket?.emit(Events.UPDATED_NEXT_PIECE, { nextPiece: next, nextPieceShape: Shapes[next][0] });
    this.bagIndex++;
    return this.board.setCurrPiece(current);
  }

  start(bag: Tetrominos, notify: (data: { id: number; name: string; alive: boolean }) => void, onStop: () => void) {
    if (!this.socket) return;

    this.score = 0;
    this.bagIndex = 0;
    this.notify = notify;
    this.onStop = onStop;
    this.bag = bag;
    this.board = new Board(this.updateScore.bind(this));
    this.handleNextPiece();
    this.sendBoard();
    this.notify(this.toPayload());

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
      if (!this.handleNextPiece()) {
        this.alive = false;
        this.stop();
      }
    }
    this.sendBoard();
    this.sendScore();
    this.notify(this.toPayload());
  }

  stop() {
    if (!this.socket || !this.handleKeys) return;
    this.alive = false;
    this.notify(this.toPayload());

    for (const [key, fn] of Object.entries(this.handleKeys)) {
      this.socket.off(key, fn);
    }
    if (this.tickInterval) clearInterval(this.tickInterval);

    this.onStop();
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
      score: this.score,
    };
  }
}
