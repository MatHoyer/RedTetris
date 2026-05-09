import { type TGameMode } from '../../../events/index.js';
import { Board } from './Board.js';
import { Tetrominos } from './Tetrominos.js';
import { Shapes } from './shapes.js';
import { PlayerPort } from './ports.js';

export enum PlayerState {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  LOCK_DELAY = 'LOCK_DELAY',
}
type PlayerPayload = { id: number; name: string; alive: boolean; score: number };
type EnabledModes = Record<TGameMode, boolean>;

const LOCK_DELAY_TICKS = 30;
const FALL_PROGRESS_PER_ROW = 256;
const NORMAL_FALL_PROGRESS_PER_TICK = 4;
const FAST_FALL_PROGRESS_PER_TICK = 8;
const SOFT_DROP_FALL_PROGRESS_PER_TICK = FALL_PROGRESS_PER_ROW;

export class Player {
  board = new Board();
  alive = true;
  score = 0;
  state: PlayerState = PlayerState.IDLE;

  fallProgress = 0;
  lockDelayCounter = 0;

  heldKeys: Record<string, boolean> = {};

  modes: TGameMode[] = [];
  enabledModes: EnabledModes = {
    fast: false,
    inverted: false,
    easy: false,
  };
  bag!: Tetrominos;
  bagIndex = 0;
  notify: (data: PlayerPayload) => void = () => {};
  onStop: () => void = () => {};
  onLinesCleared: (count: number) => void = () => {};
  onBoardUpdate: (playerId: number, spectrum: number[]) => void = () => {};

  private keyDownHandlers: Record<string, () => void> | null = null;
  private keyUpHandlers: Record<string, () => void> | null = null;

  constructor(
    readonly id: number,
    public name: string,
    readonly socketId: string | null,
    readonly port: PlayerPort | null = null,
  ) {}

  updatePlayer(name: string) {
    this.name = name;
  }

  handleNextPiece() {
    this.lockDelayCounter = 0;
    const { current, next } = this.bag.getPiece(this.bagIndex);
    this.port?.emitNextPiece(next, Shapes[next][0]);
    this.bagIndex++;
    return this.board.setCurrentPiece(current);
  }

  start(
    bag: Tetrominos,
    notify: (data: PlayerPayload) => void,
    onStop: () => void,
    onLinesCleared: (count: number) => void,
    onBoardUpdate: (playerId: number, spectrum: number[]) => void,
    modes: TGameMode[] = [],
  ) {
    if (!this.port) return;

    this.modes = modes;
    this.enabledModes = this.toEnabledModes(modes);
    this.score = 0;
    this.bagIndex = 0;
    this.fallProgress = 0;
    this.lockDelayCounter = 0;
    this.heldKeys = {};
    this.notify = notify;
    this.onStop = onStop;
    this.onLinesCleared = onLinesCleared;
    this.onBoardUpdate = onBoardUpdate;
    this.bag = bag;
    this.board = new Board();

    this.handleNextPiece();
    this.state = PlayerState.ACTIVE;
    this.alive = true;
    this.sendBoard();
    this.sendScore();
    this.notify(this.toPayload());

    this.registerKeyHandlers();
  }

  private toEnabledModes(modes: TGameMode[]): EnabledModes {
    const enabledModes: EnabledModes = {
      fast: false,
      inverted: false,
      easy: false,
    };

    for (const mode of modes) {
      enabledModes[mode] = true;
    }

    return enabledModes;
  }

  private registerKeyHandlers() {
    const inverted = this.enabledModes.inverted;
    const leftDir = inverted ? 'right' : 'left';
    const rightDir = inverted ? 'left' : 'right';

    this.keyDownHandlers = {
      down: () => {
        this.heldKeys['down'] = true;
      },
      left: () => {
        this.heldKeys['left'] = true;
        if (this.state === PlayerState.ACTIVE || this.state === PlayerState.LOCK_DELAY) {
          this.board.moveHorizontal(leftDir);
        }
      },
      right: () => {
        this.heldKeys['right'] = true;
        if (this.state === PlayerState.ACTIVE || this.state === PlayerState.LOCK_DELAY) {
          this.board.moveHorizontal(rightDir);
        }
      },
      rotate: () => {
        this.heldKeys['rotate'] = true;
      },
      hardDrop: () => {
        if (this.state === PlayerState.ACTIVE || this.state === PlayerState.LOCK_DELAY) {
          this.board.hardMoveDown();
          this.finishTurn();
        }
      },
    };

    this.keyUpHandlers = {
      down: () => {
        this.heldKeys['down'] = false;
      },
      left: () => {
        this.heldKeys['left'] = false;
      },
      right: () => {
        this.heldKeys['right'] = false;
      },
      rotate: () => {
        this.heldKeys['rotate'] = false;
      },
    };

    this.port!.onKeyDown(this.keyDownHandlers);
    this.port!.onKeyUp(this.keyUpHandlers);
  }

  tick() {
    switch (this.state) {
      case PlayerState.ACTIVE:
        this.tickActive();
        break;
      case PlayerState.LOCK_DELAY:
        this.tickLockDelay();
        break;
    }
  }

  private tickActive() {
    if (this.heldKeys['rotate']) {
      this.board.rotateCurrentPiece();
      this.heldKeys['rotate'] = false;
    }

    this.applyHeldHorizontalMovement();

    this.fallProgress += this.enabledModes.fast ? FAST_FALL_PROGRESS_PER_TICK : NORMAL_FALL_PROGRESS_PER_TICK;

    if (this.heldKeys['down']) {
      this.fallProgress += SOFT_DROP_FALL_PROGRESS_PER_TICK;
    }

    while (this.fallProgress >= FALL_PROGRESS_PER_ROW) {
      this.fallProgress -= FALL_PROGRESS_PER_ROW;
      this.board.clear();
      if (this.board.canMoveCurrentPieceDown()) {
        this.board.moveDown();
        this.board.draw();
      } else {
        this.board.draw();
        this.fallProgress = 0;
        this.state = PlayerState.LOCK_DELAY;
        return;
      }
    }
  }

  private tickLockDelay() {
    if (this.heldKeys['rotate']) {
      this.board.rotateCurrentPiece();
      this.heldKeys['rotate'] = false;
    }

    this.applyHeldHorizontalMovement();

    this.board.clear();
    if (this.board.canMoveCurrentPieceDown()) {
      this.board.draw();
      this.state = PlayerState.ACTIVE;
      this.fallProgress = 0;
      return;
    }
    this.board.draw();

    this.lockDelayCounter++;
    if (this.lockDelayCounter >= LOCK_DELAY_TICKS) {
      this.board.lockCurrentPiece();
      this.finishTurn();
    }
  }

  private applyHeldHorizontalMovement() {
    if (this.heldKeys['left']) {
      this.board.moveHorizontal(this.enabledModes.inverted ? 'right' : 'left');
    }
    if (this.heldKeys['right']) {
      this.board.moveHorizontal(this.enabledModes.inverted ? 'left' : 'right');
    }
  }

  private applyScoring(linesCleared: number) {
    this.score += linesCleared;
  }

  private finishTurn() {
    const cleared = this.board.removeMarkedRows();
    this.applyScoring(cleared);
    if (cleared > 0) this.onLinesCleared(cleared);

    this.fallProgress = 0;
    this.lockDelayCounter = 0;

    if (!this.handleNextPiece()) {
      this.alive = false;
      this.stop();
      return;
    }

    this.state = PlayerState.ACTIVE;
    this.sendBoard();
    this.sendScore();
    this.notify(this.toPayload());
  }

  stop() {
    if (!this.port || !this.keyDownHandlers || !this.keyUpHandlers) return;
    this.alive = false;
    this.state = PlayerState.IDLE;
    this.notify(this.toPayload());

    this.port.offKeyDown(this.keyDownHandlers);
    this.port.offKeyUp(this.keyUpHandlers);
    this.keyDownHandlers = null;
    this.keyUpHandlers = null;

    this.onStop();
  }

  forceStop() {
    if (!this.port || !this.keyDownHandlers || !this.keyUpHandlers) return;
    this.alive = false;
    this.state = PlayerState.IDLE;

    this.port.offKeyDown(this.keyDownHandlers);
    this.port.offKeyUp(this.keyUpHandlers);
    this.keyDownHandlers = null;
    this.keyUpHandlers = null;
  }

  sendBoard() {
    this.port?.emitBoard(this.board.toPayload(this.enabledModes.easy));
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
