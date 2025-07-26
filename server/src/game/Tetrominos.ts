import { tetrominoes, TTetromino } from '../../../events/index.js';

/**
 * https://en.wikipedia.org/wiki/Tetromino
 */
export class Tetrominos {
  bag: TTetromino[];

  constructor() {
    this.bag = [];
    this.refillBag();
    this.refillBag();
  }

  refillBag() {
    const newPiece = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    this.bag.push(newPiece);
  }

  getPiece(index: number) {
    if (index === this.bag.length - 2) {
      this.refillBag();
    }

    return { current: this.bag[index], next: this.bag[index + 1] };
  }
}
