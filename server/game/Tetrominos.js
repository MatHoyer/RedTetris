/**
 * https://en.wikipedia.org/wiki/Tetromino
 */
export class Tetrominos {
  constructor() {
    this.bag = [];
    this.refillBag();
  }

  refillBag() {
    const pieces = ["I", "O", "T", "J", "L", "S", "Z"];
    this.bag = this.shuffle(pieces);
  }

  shuffle(array) {
    let curr = array.length;

    while (curr !== 0) {
      let rdmIdx = Math.floor(Math.random() * curr);
      curr--;
      [array[curr], array[rdmIdx]] = [array[rdmIdx], array[curr]];
    }

    return array;
  }

  getNextPiece() {
    if (this.bag.length === 0) {
      this.refillBag();
    }

    return this.bag.pop();
  }
}
