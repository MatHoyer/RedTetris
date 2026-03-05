import { TTetromino } from '../../../events/index.js';
import logger from '../logger.js';
import { Piece } from './Piece.js';
import { Shapes } from './shapes.js';

const log = logger.child({ component: 'Board' });

const GRID_HEIGHT = 20;
const GRID_WIDTH = 10;

export type TCell = TTetromino | 'empty' | 'penalty';

const createEmptyRow = (): TCell[] => Array<TCell>(GRID_WIDTH).fill('empty');

export class Board {
  grid: TCell[][] = Array.from({ length: GRID_HEIGHT }, createEmptyRow);
  currPiece: Piece | null = null;
  position: [number, number] = [0, 0];

  constructor(readonly updateScore: (addScore: number) => void = () => {}) {}

  setCurrPiece(tetromino: TTetromino) {
    this.currPiece = new Piece(tetromino, Shapes[tetromino]);
    this.position = [0, 4];
    const canPlace = this.canPlaceCurrPiece({});
    if (canPlace) this.draw();
    return canPlace;
  }

  moveCurrPieceDown() {
    this.clear();
    if (this.canMoveCurrPieceDown()) {
      this.moveDown();
      this.draw();
      this.updateScore(1);
      return true;
    }
    this.draw();
    return false;
  }

  hardMoveDown() {
    this.clear();
    while (this.canMoveCurrPieceDown()) {
      this.moveDown();
      this.updateScore(2);
    }
    return this.lockCurrentPiece();
  }

  lockCurrentPiece(): number {
    this.draw();
    this.currPiece = null;
    return this.checkCompleteRows();
  }

  moveHorizontal(direction: 'left' | 'right') {
    this.clear();
    if (this.canMoveHorizontal(direction)) {
      direction === 'left' ? this.moveLeft() : this.moveRight();
    }
    this.draw();
  }

  canPlaceCurrPiece({ modX = 0, modY = 0 }: { modX?: 0 | 1; modY?: 0 | 1 | -1 }) {
    if (!this.currPiece) return false;
    const shape = this.currPiece.getCurrentConfig();
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newRow = this.position[0] + row + modX;
          const newCol = this.position[1] + col + modY;
          if (newRow < 0 || newRow >= GRID_HEIGHT || newCol < 0 || newCol >= GRID_WIDTH) {
            return false;
          }
          if (this.grid[newRow][newCol] !== 'empty') {
            return false;
          }
        }
      }
    }
    return true;
  }

  canMoveCurrPieceDown() {
    return this.canPlaceCurrPiece({ modX: 1 });
  }

  canMoveHorizontal(direction: 'left' | 'right') {
    return this.canPlaceCurrPiece({ modY: direction === 'left' ? -1 : 1 });
  }

  rotateCurrPiece() {
    this.clear();
    if (this.canRotateCurrPiece()) {
      this.currPiece!.rotate();
    }
    this.draw();
  }

  canRotateCurrPiece() {
    if (!this.currPiece) return false;
    const nextRotation = this.currPiece.currRotIdx + 1;
    const nextConf = this.currPiece.configs[nextRotation % this.currPiece.configs.length];
    for (let row = 0; row < nextConf.length; row++) {
      for (let col = 0; col < nextConf[row].length; col++) {
        if (nextConf[row][col]) {
          const newRow = this.position[0] + row;
          const newCol = this.position[1] + col;
          if (newRow < 0 || newRow >= GRID_HEIGHT || newCol < 0 || newCol >= GRID_WIDTH) {
            return false;
          }
          if (this.grid[newRow][newCol] !== 'empty') {
            return false;
          }
        }
      }
    }
    return true;
  }

  clear() {
    if (!this.currPiece) return;
    const shape = this.currPiece.getCurrentConfig();
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          this.grid[this.position[0] + row][this.position[1] + col] = 'empty';
        }
      }
    }
  }

  moveDown() {
    this.position[0]++;
  }

  moveLeft() {
    this.position[1]--;
  }

  moveRight() {
    this.position[1]++;
  }

  lock() {
    this.draw();
    this.currPiece = null;
    this.checkCompleteRows();
  }

  draw() {
    if (!this.currPiece) return;
    const shape = this.currPiece.getCurrentConfig();
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          this.grid[this.position[0] + i][this.position[1] + j] = this.currPiece.shape;
        }
      }
    }
  }

  checkCompleteRows(): number {
    let cleared = 0;
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].some((cell) => cell === 'penalty')) continue;
      if (this.grid[i].every((cell) => cell !== 'empty')) {
        this.grid.splice(i, 1);
        this.grid.unshift(createEmptyRow());
        this.updateScore(100);
        cleared++;
      }
    }
    return cleared;
  }

  addPenaltyLines(count: number) {
    this.grid.splice(0, count);
    for (let i = 0; i < count; i++) {
      this.grid.push(Array<TCell>(GRID_WIDTH).fill('penalty'));
    }
  }

  getSpectrum(): number[] {
    const spectrum: number[] = [];
    for (let col = 0; col < GRID_WIDTH; col++) {
      let height = 0;
      for (let row = 0; row < GRID_HEIGHT; row++) {
        if (this.grid[row][col] !== 'empty') {
          height = GRID_HEIGHT - row;
          break;
        }
      }
      spectrum.push(height);
    }
    return spectrum;
  }

  print() {
    for (const row of this.grid) {
      log.debug(row.join(' '));
    }
  }

  toPayload() {
    return this.grid;
  }
}
