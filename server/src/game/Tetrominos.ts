/**
 * https://en.wikipedia.org/wiki/Tetromino
 */
export class Tetrominos {
  bag: string[];

  constructor() {
    this.bag = [];
    this.refillBag();
  }

  refillBag() {
    const pieces = ['I', 'O', 'T', 'J', 'L', 'S', 'Z'];
    this.bag = this.shuffle(pieces);
  }

  shuffle(array: string[]) {
    let currentIndex = array.length;

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
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
