import { Shapes } from "../shapes.js";
import { Piece } from "./Piece.js";

export class Board {
  constructor() {
    this.grid = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }).fill(0),
    );
    this.currPiece = null;
    this.position = [0, 0];
  }

  setCurrPiece(tetromino) {
    this.currPiece = new Piece(tetromino, Shapes[tetromino]);
    this.position = [0, 4]; // middle of the board at the top
  }

  moveCurrPieceDown() {
    if (this.canMoveCurrPieceDown()) {
      this.moveDown(this.currPiece);
    
      return true;
    }
    this.lock();

    return false;
  }

  moveHorizontal(direction) {
    if (direction === "left") {
      if (this.canMoveHorizontal("left")) {
        this.clear();
        this.position[1]--;
        this.draw();
      }
    } else {
      if (this.canMoveHorizontal("right")) {
        this.clear();
        this.position[1]++;
        this.draw();
      }
    }
  }

  canMoveHorizontal(direction) {
    const shape = this.currPiece.getCurrentConfig();
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          if (direction === "left") {
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
    if (this.canRotateCurrPiece()) {
      this.currPiece.rotate();
      return true;
    }

    return false;
  }

  canMoveCurrPieceDown() {
    const shape = this.currPiece.getCurrentConfig();
    if (this.position[0] + shape.length >= 20) return false;
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
    const shape = this.currPiece.getCurrentConfig();
    const nextRotation = this.currPiece.currRotIdx + 1;
    const nextConf =
      this.currPiece.configs[nextRotation % this.currPiece.configs.length];
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
    const shape = this.currPiece.getCurrentConfig();
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          this.grid[this.position[0] + row][this.position[1] + col] = 0;
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
    const shape = this.currPiece.getCurrentConfig();
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          this.grid[this.position[0] + i][this.position[1] + j] = 1;
        }
      }
    }
  }

  checkCompleteRows() {
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].every((cell) => cell === 1)) {
        this.grid.splice(i, 1);
        this.grid.unshift(Array.from({ length: 10 }).fill(0));
      }
    }
  }

  print() {
    for (let i = 0; i < this.grid.length; i++) {
      console.log(this.grid[i].join(" "));
    }
  }
}
