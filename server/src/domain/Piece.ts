import { TShape, TTetromino } from '../../../events/index.js';

export class Piece {
  currRotIdx = 0;

  constructor(
    readonly shape: TTetromino,
    readonly configs: TShape[],
  ) {}

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
