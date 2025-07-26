import { tetrominoes, TTetromino } from '../../../events/index.js';
import { Piece } from './Piece.js';
import { Shapes } from './shapes.js';

const GRID_HEIGHT = 20;
const GRID_WIDTH = 10;

export class Board {
  grid: (TTetromino | 'empty')[][];
  currPiece: Piece | null;
  position: [number, number];
  updateScore: (addScore: number) => void;

  constructor(updateScore?: (addScore: number) => void) {
    this.grid = Array.from({ length: GRID_HEIGHT }, () =>
      Array.from<TTetromino | 'empty'>({ length: GRID_WIDTH }).fill('empty')
    );
    this.currPiece = null;
    this.position = [0, 0];
    this.updateScore = updateScore || (() => {});
  }

  randomNewPiece() {
    const canPlace = this.setCurrPiece(tetrominoes[Math.floor(Math.random() * tetrominoes.length)]);
    if (canPlace) this.draw();
    return canPlace;
  }

  setCurrPiece(tetromino: TTetromino) {
    this.currPiece = new Piece(tetromino, Shapes[tetromino]);
    this.position = [0, 4];
    if (!this.canPlaceCurrPiece({})) {
      return false;
    }
    return true;
  }

  moveCurrPieceDown() {
    this.clear();
    if (this.canMoveCurrPieceDown()) {
      this.moveDown();
      this.draw();
      this.updateScore(1);

      return true;
    }
    this.lock();

    return false;
  }

  hardMoveDown() {
    this.clear();
    while (this.canMoveCurrPieceDown()) {
      this.moveDown();
      this.updateScore(2);
    }
    this.lock();
  }

  moveHorizontal(direction: 'left' | 'right') {
    this.clear();

    if (direction === 'left') {
      if (this.canMoveHorizontal('left')) {
        this.moveLeft();
      }
    } else {
      if (this.canMoveHorizontal('right')) {
        this.moveRight();
      }
    }

    this.draw();
  }

  canPlaceCurrPiece({ modX = 0, modY = 0 }: { modX?: 0 | 1; modY?: 0 | 1 | -1 }) {
    if (!this.currPiece) return false;
    const shape = this.currPiece.getCurrentConfig();
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          if (modX && this.position[0] + row + modX >= GRID_HEIGHT) {
            return false;
          }
          if (this.grid[this.position[0] + row + modX][this.position[1] + col + modY] !== 'empty') {
            return false;
          }
        }
      }
    }

    return true;
  }

  canMoveCurrPieceDown() {
    return this.canPlaceCurrPiece({
      modX: 1,
    });
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
    const shape = this.currPiece.getCurrentConfig();
    const nextRotation = this.currPiece.currRotIdx + 1;
    const nextConf = this.currPiece.configs[nextRotation % this.currPiece.configs.length];
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (nextConf[row][col]) {
          if (this.grid[this.position[0] + row][this.position[1] + col] !== 'empty') {
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

  checkCompleteRows() {
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].every((cell) => cell !== 'empty')) {
        this.grid.splice(i, 1);
        this.grid.unshift(Array.from<TTetromino | 'empty'>({ length: GRID_WIDTH }).fill('empty'));
        this.updateScore(100);
      }
    }
  }

  print() {
    for (let i = 0; i < this.grid.length; i++) {
      console.log(this.grid[i].join(' '));
    }
  }

  toPayload() {
    return this.grid;
  }
}
