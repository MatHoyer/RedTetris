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
  lockPending: boolean;
  notify: (data: { id: number; name: string; alive: boolean }) => void;
  onStop: () => void;
  onLinesCleared: (count: number) => void;
  onBoardUpdate: (playerId: number, spectrum: number[]) => void;

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
    this.lockPending = false;
    this.notify = () => {};
    this.onStop = () => {};
    this.onLinesCleared = () => {};
    this.onBoardUpdate = () => {};
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

  start(
    bag: Tetrominos,
    notify: (data: { id: number; name: string; alive: boolean }) => void,
    onStop: () => void,
    onLinesCleared: (count: number) => void,
    onBoardUpdate: (playerId: number, spectrum: number[]) => void
  ) {
    if (!this.socket) return;

    this.score = 0;
    this.bagIndex = 0;
    this.lockPending = false;
    this.notify = notify;
    this.onStop = onStop;
    this.onLinesCleared = onLinesCleared;
    this.onBoardUpdate = onBoardUpdate;
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
      ' ': () => {
        const cleared = this.board.hardMoveDown();
        this.lockPending = false;
        if (cleared > 1) this.onLinesCleared(cleared);
        if (!this.handleNextPiece()) {
          this.alive = false;
          this.stop();
        }
        this.sendBoard();
        this.sendScore();
        this.notify(this.toPayload());
      },
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
    if (this.lockPending) {
      if (this.board.canMoveCurrPieceDown()) {
        // Player adjusted the piece — it can move again, reset lock
        this.lockPending = false;
        this.board.moveCurrPieceDown();
      } else {
        // Still can't move — lock it
        this.lockPending = false;
        const cleared = this.board.lockCurrentPiece();
        if (cleared > 1) this.onLinesCleared(cleared);
        if (!this.handleNextPiece()) {
          this.alive = false;
          this.stop();
        }
      }
    } else {
      const moved = this.board.moveCurrPieceDown();
      if (!moved) {
        this.lockPending = true;
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

  forceStop() {
    if (!this.socket || !this.handleKeys) return;
    this.alive = false;

    for (const [key, fn] of Object.entries(this.handleKeys)) {
      this.socket.off(key, fn);
    }
    if (this.tickInterval) clearInterval(this.tickInterval);
  }

  sendBoard() {
    this.socket?.emit(Events.UPDATED_BOARD, { board: this.board.grid });
    this.onBoardUpdate(this.id, this.board.getSpectrum());
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
