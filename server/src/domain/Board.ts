import { TTetromino } from '../../../events/index.js';
import logger from '../logger.js';
import { Piece } from './Piece.js';
import { Shapes } from './shapes.js';

const log = logger.child({ component: 'Board' });

export const GRID_HEIGHT = 21;
const GRID_WIDTH = 10;

export type TCell = TTetromino | 'empty' | 'penalty';

const createEmptyRow = (): TCell[] => Array<TCell>(GRID_WIDTH).fill('empty');

export class Board {
  grid: TCell[][] = Array.from({ length: GRID_HEIGHT }, createEmptyRow);
  currPiece: Piece | null = null;
  position: [number, number] = [0, 0];

  setCurrPiece(tetromino: TTetromino, initialRotation?: number) {
    this.currPiece = new Piece(tetromino, Shapes[tetromino]);
    if (initialRotation !== undefined) {
      this.currPiece.currRotIdx = initialRotation % this.currPiece.configs.length;
    }
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
      return true;
    }
    this.draw();
    return false;
  }

  hardMoveDown() {
    this.clear();
    let dropDistance = 0;
    while (this.canMoveCurrPieceDown()) {
      this.moveDown();
      dropDistance++;
    }
    this.lockCurrentPiece();
    return dropDistance;
  }

  lockCurrentPiece() {
    this.draw();
    this.currPiece = null;
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
    if (!this.currPiece) return;
    this.clear();

    const shape = this.currPiece.shape;

    if (shape === 'O') {
      this.draw();
      return;
    }

    const nextRotIdx = (this.currPiece.currRotIdx + 1) % this.currPiece.configs.length;
    const nextConf = this.currPiece.configs[nextRotIdx];

    if (this.canPlaceConfig(nextConf, 0, 0)) {
      this.currPiece.currRotIdx = nextRotIdx;
      this.draw();
      return;
    }

    if (shape === 'I') {
      this.draw();
      return;
    }

    const hasCenterColumnRule = shape === 'L' || shape === 'J' || shape === 'T';
    if (hasCenterColumnRule && this.firstCollisionInCenterColumn(nextConf)) {
      this.draw();
      return;
    }

    for (const colOff of [1, -1]) {
      if (this.canPlaceConfig(nextConf, 0, colOff)) {
        this.position[1] += colOff;
        this.currPiece.currRotIdx = nextRotIdx;
        this.draw();
        return;
      }
    }

    this.draw();
  }

  canRotateCurrPiece() {
    if (!this.currPiece) return false;
    if (this.currPiece.shape === 'O') return false;

    const nextRotIdx = (this.currPiece.currRotIdx + 1) % this.currPiece.configs.length;
    const nextConf = this.currPiece.configs[nextRotIdx];

    if (this.canPlaceConfig(nextConf, 0, 0)) return true;
    if (this.currPiece.shape === 'I') return false;

    const hasCenterColumnRule =
      this.currPiece.shape === 'L' || this.currPiece.shape === 'J' || this.currPiece.shape === 'T';
    if (hasCenterColumnRule && this.firstCollisionInCenterColumn(nextConf)) return false;

    for (const colOff of [1, -1]) {
      if (this.canPlaceConfig(nextConf, 0, colOff)) return true;
    }
    return false;
  }

  private canPlaceConfig(config: number[][], rowOff: number, colOff: number): boolean {
    for (let row = 0; row < config.length; row++) {
      for (let col = 0; col < config[row].length; col++) {
        if (config[row][col]) {
          const newRow = this.position[0] + row + rowOff;
          const newCol = this.position[1] + col + colOff;
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

  private firstCollisionInCenterColumn(config: number[][]): boolean {
    const centerCol = Math.floor(config[0].length / 2);
    for (let row = 0; row < config.length; row++) {
      for (let col = 0; col < config[row].length; col++) {
        if (config[row][col]) {
          const newRow = this.position[0] + row;
          const newCol = this.position[1] + col;
          const collides =
            newRow < 0 || newRow >= GRID_HEIGHT || newCol < 0 || newCol >= GRID_WIDTH ||
            this.grid[newRow][newCol] !== 'empty';
          if (collides) return col === centerCol;
        }
      }
    }
    return false;
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

  markCompleteRows(): number {
    let count = 0;
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].some((cell) => cell === 'penalty')) continue;
      if (this.grid[i].every((cell) => cell !== 'empty')) {
        count++;
      }
    }
    return count;
  }

  removeMarkedRows(): number {
    let cleared = 0;
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].some((cell) => cell === 'penalty')) continue;
      if (this.grid[i].every((cell) => cell !== 'empty')) {
        this.grid.splice(i, 1);
        this.grid.unshift(createEmptyRow());
        cleared++;
      }
    }
    return cleared;
  }

  checkCompleteRows(): number {
    return this.removeMarkedRows();
  }

  isBoardEmpty(): boolean {
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        if (this.grid[row][col] !== 'empty') return false;
      }
    }
    return true;
  }

  addPenaltyLines(count: number) {
    this.grid.splice(1, count);
    for (let i = 0; i < count; i++) {
      this.grid.push(Array<TCell>(GRID_WIDTH).fill('penalty'));
    }
  }

  getSpectrum(): number[] {
    const spectrum: number[] = [];
    const visibleHeight = GRID_HEIGHT - 1; // 20 visible rows
    for (let col = 0; col < GRID_WIDTH; col++) {
      let height = 0;
      for (let row = 1; row < GRID_HEIGHT; row++) {
        if (this.grid[row][col] !== 'empty') {
          height = visibleHeight - (row - 1);
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
    return this.grid.slice(1);
  }
}
