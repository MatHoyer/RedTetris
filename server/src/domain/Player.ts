import { type TGameMode } from '../../../events/index.js';
import { Board } from './Board.js';
import { Tetrominos } from './Tetrominos.js';
import { Shapes } from './shapes.js';
import { PlayerPort } from './ports.js';

export enum PlayerState {
  IDLE = 'IDLE',
  ARE = 'ARE',
  ACTIVE = 'ACTIVE',
  LOCK_DELAY = 'LOCK_DELAY',
  LINE_CLEAR = 'LINE_CLEAR',
}
type PlayerPayload = { id: number; name: string; alive: boolean; score: number; level: number };

const LOCK_DELAY_FRAMES = 30;
const ARE_FRAMES = 30;
const LINE_CLEAR_FRAMES = 41;
const DAS_CHARGE_FRAMES = 16;

export class Player {
  board = new Board();
  alive = true;
  score = 0;
  level = 0;
  combo = 1;
  state: PlayerState = PlayerState.IDLE;

  gravityAccumulator = 0;
  softDropFrames = 0;
  lockDelayCounter = 0;
  areCounter = 0;
  lineClearCounter = 0;
  pendingLinesCleared = 0;

  heldKeys: Record<string, boolean> = {};
  dasDirection: 'left' | 'right' | null = null;
  dasCounter = 0;
  irsRotation = false;

  modes: TGameMode[] = [];
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
    const { current, next } = this.bag.getPiece(this.bagIndex);
    this.port?.emitNextPiece(next, Shapes[next][0]);
    this.bagIndex++;
    const initialRotation = this.irsRotation ? 1 : undefined;
    this.irsRotation = false;
    return this.board.setCurrPiece(current, initialRotation);
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
    this.score = 0;
    this.level = 0;
    this.combo = 1;
    this.bagIndex = 0;
    this.softDropFrames = 0;
    this.gravityAccumulator = 0;
    this.lockDelayCounter = 0;
    this.areCounter = 0;
    this.lineClearCounter = 0;
    this.pendingLinesCleared = 0;
    this.heldKeys = {};
    this.dasDirection = null;
    this.dasCounter = 0;
    this.irsRotation = false;
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
    this.sendLevel();
    this.notify(this.toPayload());

    this.registerKeyHandlers();
  }

  private registerKeyHandlers() {
    const inverted = this.modes.includes('inverted');
    const leftDir = inverted ? 'right' : 'left';
    const rightDir = inverted ? 'left' : 'right';

    this.keyDownHandlers = {
      down: () => {
        this.heldKeys['down'] = true;
      },
      left: () => {
        this.heldKeys['left'] = true;
        this.dasDirection = leftDir;
        this.dasCounter = 0;
        if (this.state === PlayerState.ACTIVE || this.state === PlayerState.LOCK_DELAY) {
          this.board.moveHorizontal(leftDir);
        }
      },
      right: () => {
        this.heldKeys['right'] = true;
        this.dasDirection = rightDir;
        this.dasCounter = 0;
        if (this.state === PlayerState.ACTIVE || this.state === PlayerState.LOCK_DELAY) {
          this.board.moveHorizontal(rightDir);
        }
      },
      rotate: () => {
        this.heldKeys['rotate'] = true;
        if (this.state === PlayerState.ARE) {
          this.irsRotation = true;
        }
      },
      hardDrop: () => {
        if (this.state === PlayerState.ACTIVE || this.state === PlayerState.LOCK_DELAY) {
          this.board.hardMoveDown();
          const cleared = this.board.markCompleteRows();
          if (cleared > 0) {
            this.pendingLinesCleared = cleared;
            this.lineClearCounter = 0;
            this.state = PlayerState.LINE_CLEAR;
          } else {
            this.combo = 1;
            this.areCounter = 0;
            this.state = PlayerState.ARE;
          }
          this.incrementLevelOnPlace();
          this.sendBoard();
          this.sendScore();
          this.notify(this.toPayload());
        }
      },
    };

    this.keyUpHandlers = {
      down: () => {
        this.heldKeys['down'] = false;
      },
      left: () => {
        this.heldKeys['left'] = false;
        if (this.dasDirection === leftDir) {
          this.dasDirection = this.heldKeys['right'] ? rightDir : null;
          this.dasCounter = 0;
        }
      },
      right: () => {
        this.heldKeys['right'] = false;
        if (this.dasDirection === rightDir) {
          this.dasDirection = this.heldKeys['left'] ? leftDir : null;
          this.dasCounter = 0;
        }
      },
      rotate: () => {
        this.heldKeys['rotate'] = false;
        this.irsRotation = false;
      },
    };

    this.port!.onKeyDown(this.keyDownHandlers);
    this.port!.onKeyUp(this.keyUpHandlers);
  }

  frame() {
    if (this.state !== PlayerState.IDLE && this.dasDirection) {
      this.dasCounter++;
    }

    switch (this.state) {
      case PlayerState.ACTIVE:
        this.frameActive();
        break;
      case PlayerState.LOCK_DELAY:
        this.frameLockDelay();
        break;
      case PlayerState.LINE_CLEAR:
        this.frameLineClear();
        break;
      case PlayerState.ARE:
        this.frameAre();
        break;
    }
  }

  private frameActive() {
    if (this.heldKeys['rotate']) {
      this.board.rotateCurrPiece();
      this.heldKeys['rotate'] = false;
    }

    this.applyDasMovement();

    this.gravityAccumulator += this.modes.includes('fast') ? 8 : 4;

    if (this.heldKeys['down']) {
      this.gravityAccumulator += 256;
      this.softDropFrames++;
    }

    while (this.gravityAccumulator >= 256) {
      this.gravityAccumulator -= 256;
      this.board.clear();
      if (this.board.canMoveCurrPieceDown()) {
        this.board.moveDown();
        this.board.draw();
      } else {
        this.board.draw();
        this.gravityAccumulator = 0;
        this.lockDelayCounter = 0;
        this.state = PlayerState.LOCK_DELAY;
        return;
      }
    }
  }

  private frameLockDelay() {
    if (this.heldKeys['rotate']) {
      this.board.rotateCurrPiece();
      this.heldKeys['rotate'] = false;
    }

    this.applyDasMovement();

    this.board.clear();
    if (this.board.canMoveCurrPieceDown()) {
      this.board.draw();
      this.state = PlayerState.ACTIVE;
      this.gravityAccumulator = 0;
      return;
    }
    this.board.draw();

    this.lockDelayCounter++;
    if (this.lockDelayCounter >= LOCK_DELAY_FRAMES) {
      this.board.lockCurrentPiece();
      const cleared = this.board.markCompleteRows();
      if (cleared > 0) {
        this.pendingLinesCleared = cleared;
        this.lineClearCounter = 0;
        this.state = PlayerState.LINE_CLEAR;
      } else {
        this.combo = 1;
        this.areCounter = 0;
        this.state = PlayerState.ARE;
      }
      this.incrementLevelOnPlace();
      this.sendBoard();
      this.sendScore();
      this.notify(this.toPayload());
    }
  }

  private frameLineClear() {
    this.lineClearCounter++;
    if (this.lineClearCounter >= LINE_CLEAR_FRAMES) {
      const cleared = this.board.removeMarkedRows();
      this.applyScoring(cleared);
      this.level = Math.min(999, this.level + cleared);
      if (cleared > 0) this.onLinesCleared(cleared);
      this.sendBoard();
      this.sendScore();
      this.sendLevel();
      this.notify(this.toPayload());
      this.areCounter = 0;
      this.state = PlayerState.ARE;
    }
  }

  private frameAre() {
    if (this.heldKeys['rotate']) {
      this.irsRotation = true;
    }

    this.areCounter++;
    if (this.areCounter >= ARE_FRAMES) {
      this.softDropFrames = 0;
      this.gravityAccumulator = 0;

      if (!this.handleNextPiece()) {
        this.alive = false;
        this.stop();
        return;
      }

      this.applyDasMovement();

      this.state = PlayerState.ACTIVE;
      this.sendBoard();
      this.sendLevel();
      this.notify(this.toPayload());
    }
  }

  private applyDasMovement() {
    if (!this.dasDirection) return;
    if (this.dasCounter >= DAS_CHARGE_FRAMES) {
      this.board.moveHorizontal(this.dasDirection);
    }
  }

  private incrementLevelOnPlace() {
    if (this.level % 100 !== 99 && this.level < 999) {
      this.level = Math.min(999, this.level + 1);
      this.sendLevel();
    }
  }

  private applyScoring(linesCleared: number) {
    this.combo = this.combo + 2 * linesCleared - 2;
    const bravo = this.board.isBoardEmpty() ? 4 : 1;
    const levelFactor = Math.ceil((this.level + linesCleared) / 4);
    this.score += (levelFactor + this.softDropFrames) * linesCleared * this.combo * bravo;
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
    this.port?.emitBoard(this.board.toPayload(this.modes.includes('easy')));
    this.onBoardUpdate(this.id, this.board.getSpectrum());
  }

  sendScore() {
    this.port?.emitScore(this.score);
  }

  sendLevel() {
    this.port?.emitLevel(this.level);
  }

  toPayload(): PlayerPayload {
    const { id, name, alive, score, level } = this;
    return { id, name, alive, score, level };
  }
}
