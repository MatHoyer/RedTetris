import { TShape, TTetromino } from '../../../events/index.js';

export class Piece {
  currentRotationIndex = 0;

  constructor(
    readonly shape: TTetromino,
    readonly configs: TShape[],
  ) {}

  rotate(clockwise = true) {
    if (clockwise) {
      this.currentRotationIndex = (this.currentRotationIndex + 1) % this.configs.length;
    } else {
      this.currentRotationIndex = (this.currentRotationIndex - 1 + this.configs.length) % this.configs.length;
    }
  }

  getCurrentConfig() {
    return this.configs[this.currentRotationIndex];
  }
}
