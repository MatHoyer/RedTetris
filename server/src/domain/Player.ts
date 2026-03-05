import { Board } from './Board.js';
import { Tetrominos } from './Tetrominos.js';
import { Shapes } from './shapes.js';
import { PlayerPort } from './ports.js';

type PlayerPayload = { id: number; name: string; alive: boolean; score: number };

export class Player {
  board = new Board();
  readonly tickRate = 800;
  tickInterval: ReturnType<typeof setInterval> | null = null;
  alive = true;
  score = 0;
  handleKeys: Record<string, () => void> | null = null;
  bag = new Tetrominos();
  bagIndex = 0;
  lockPending = false;
  notify: (data: PlayerPayload) => void = () => {};
  onStop: () => void = () => {};
  onLinesCleared: (count: number) => void = () => {};
  onBoardUpdate: (playerId: number, spectrum: number[]) => void = () => {};

  constructor(
    readonly id: number,
    public name: string,
    readonly socketId: string | null,
    readonly port: PlayerPort | null = null,
  ) {}

  updatePlayer(name: string) {
    this.name = name;
  }

  updateScore(addScore: number) {
    this.score += addScore;
  }

  handleNextPiece() {
    const { current, next } = this.bag.getPiece(this.bagIndex);
    this.port?.emitNextPiece(next, Shapes[next][0]);
    this.bagIndex++;
    return this.board.setCurrPiece(current);
  }

  start(
    bag: Tetrominos,
    notify: (data: PlayerPayload) => void,
    onStop: () => void,
    onLinesCleared: (count: number) => void,
    onBoardUpdate: (playerId: number, spectrum: number[]) => void,
  ) {
    if (!this.port) return;

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

    this.port.onKeyInput(this.handleKeys);

    this.alive = true;
    this.tickInterval = setInterval(() => this.tick(), this.tickRate);
  }

  tick() {
    if (this.lockPending) {
      if (this.board.canMoveCurrPieceDown()) {
        this.lockPending = false;
        this.board.moveCurrPieceDown();
      } else {
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
    if (!this.port || !this.handleKeys) return;
    this.alive = false;
    this.notify(this.toPayload());

    this.port.offKeyInput(this.handleKeys);
    if (this.tickInterval) clearInterval(this.tickInterval);

    this.onStop();
  }

  forceStop() {
    if (!this.port || !this.handleKeys) return;
    this.alive = false;

    this.port.offKeyInput(this.handleKeys);
    if (this.tickInterval) clearInterval(this.tickInterval);
  }

  sendBoard() {
    this.port?.emitBoard(this.board.grid);
    this.onBoardUpdate(this.id, this.board.getSpectrum());
  }

  sendScore() {
    this.port?.emitScore(this.score);
  }

  toPayload(): PlayerPayload {
    const { id, name, alive, score } = this;
    return { id, name, alive, score };
  }
}
