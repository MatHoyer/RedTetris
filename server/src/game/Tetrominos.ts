import { randomInt } from 'crypto';
import { tetrominoes, TTetromino } from '../../../events/index.js';

export class Tetrominos {
  bag: TTetromino[];

  constructor() {
    this.bag = [];
    this.refillBag();
    this.refillBag();
  }

  refillBag() {
    const pieces = [...tetrominoes];
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    this.bag.push(...pieces);
  }

  getPiece(index: number) {
    if (index >= this.bag.length - 2) {
      this.refillBag();
    }

    return { current: this.bag[index], next: this.bag[index + 1] };
  }
}
