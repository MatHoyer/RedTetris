export class Piece {
  constructor(shape, configs) {
    this.shape = shape;
    this.currRotIdx = 0;
    this.configs = configs;
  }

  rotate(clockwise = true) {
    if (clockwise) {
      this.currRotIdx = (this.currRotIdx + 1) % this.configs.length;
    } else {
      this.currRotIdx =
        (this.currRotIdx - 1 + this.configs.length) % this.configs.length;
    }
  }

  getCurrentConfig() {
    return this.configs[this.currRotIdx];
  }
}
