import { tetrominoes, TTetromino } from '../../../events/index.js';
import { Piece } from './Piece.js';
import { Shapes } from './shapes.js';

const GRID_HEIGHT = 20;
const GRID_WIDTH = 10;

export class Board {
  grid: (TTetromino | 'empty')[][];
  currPiece: Piece | null;
  position: [number, number];

  constructor() {
    this.grid = Array.from({ length: GRID_HEIGHT }, () =>
      Array.from<TTetromino | 'empty'>({ length: GRID_WIDTH }).fill('empty')
    );
    this.currPiece = null;
    this.position = [0, 0];
  }

  randomNewPiece() {
    this.setCurrPiece(tetrominoes[Math.floor(Math.random() * tetrominoes.length)]);
  }

  setCurrPiece(tetromino: TTetromino) {
    this.currPiece = new Piece(tetromino, Shapes[tetromino]);
    this.position = [0, 4]; // middle of the board at the top
  }

  moveCurrPieceDown() {
    if (this.canMoveCurrPieceDown()) {
      this.moveDown();

      return true;
    }
    this.lock();

    return false;
  }

  moveHorizontal(direction: 'left' | 'right') {
    if (direction === 'left') {
      if (this.canMoveHorizontal('left')) {
        this.clear();
        this.position[1]--;
        this.draw();
      }
    } else {
      if (this.canMoveHorizontal('right')) {
        this.clear();
        this.position[1]++;
        this.draw();
      }
    }
  }

  canMoveHorizontal(direction: 'left' | 'right') {
    if (!this.currPiece) return false;
    const shape = this.currPiece.getCurrentConfig();
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          if (direction === 'left') {
            if (this.grid[this.position[0] + row][this.position[1] + col - 1]) {
              return false;
            }
          } else {
            if (this.grid[this.position[0] + row][this.position[1] + col + 1]) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  rotateCurrPiece() {
    if (!this.currPiece) return false;
    if (this.canRotateCurrPiece()) {
      this.currPiece.rotate();
      return true;
    }

    return false;
  }

  canMoveCurrPieceDown() {
    if (!this.currPiece) return false;
    const shape = this.currPiece.getCurrentConfig();
    if (this.position[0] + shape.length >= GRID_HEIGHT) return false;
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          if (this.grid[this.position[0] + row + 1][this.position[1] + col]) {
            return false;
          }
        }
      }
    }

    return true;
  }

  canRotateCurrPiece() {
    if (!this.currPiece) return false;
    const shape = this.currPiece.getCurrentConfig();
    const nextRotation = this.currPiece.currRotIdx + 1;
    const nextConf = this.currPiece.configs[nextRotation % this.currPiece.configs.length];
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (nextConf[row][col]) {
          if (this.grid[this.position[0] + row][this.position[1] + col]) {
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
    this.clear();
    this.position[0]++;
    this.draw();
  }

  lock() {
    this.draw();
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
