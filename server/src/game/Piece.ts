import { TShape, TTetromino } from '../../../events/index.js';

export class Piece {
  shape: TTetromino;
  currRotIdx: number;
  configs: TShape[];

  constructor(shape: TTetromino, configs: TShape[]) {
    this.shape = shape;
    this.currRotIdx = 0;
    this.configs = configs;
  }

  rotate(clockwise = true) {
    if (clockwise) {
      this.currRotIdx = (this.currRotIdx + 1) % this.configs.length;
    } else {
      this.currRotIdx = (this.currRotIdx - 1 + this.configs.length) % this.configs.length;
    }
  }

  getCurrentConfig() {
    return this.configs[this.currRotIdx];
  }
}
