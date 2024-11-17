import { Tetrominos } from '../src/game/Tetrominos.js';
import { expect, test, describe } from 'vitest';

describe('Tetrominos', () => {
  test('refillBag', () => {
    // given
    const tetrominos = new Tetrominos();
    // when
    // then
    expect(tetrominos.bag).toHaveLength(7);
  });

  test('shuffle', () => {
    // given
    const tetrominos = new Tetrominos();
    const originalBag = [...tetrominos.bag];

    // when
    const shuffled = tetrominos.shuffle(tetrominos.bag);

    // then
    expect(shuffled).toHaveLength(originalBag.length);
    expect(new Set(shuffled)).toEqual(new Set(originalBag));
    const order = JSON.stringify(originalBag) !== JSON.stringify(shuffled);
    expect(order).toBe(true);
  });

  test('getNextPiece', () => {
    // given
    const tetrominos = new Tetrominos();
    const pieces = ['I', 'O', 'T', 'J', 'L', 'S', 'Z'];
    tetrominos.bag = pieces;

    // when
    const piece = tetrominos.getNextPiece();

    // then
    expect(piece).toBe('Z');
    expect(tetrominos.bag).toHaveLength(6);
  });

  test('getNextPiece with refill', () => {
    // given
    const tetrominos = new Tetrominos();
    tetrominos.getNextPiece();
    tetrominos.getNextPiece();
    tetrominos.getNextPiece();
    tetrominos.getNextPiece();
    tetrominos.getNextPiece();
    tetrominos.getNextPiece();
    tetrominos.getNextPiece();

    // when
    expect(tetrominos.bag).toHaveLength(0);

    // then
    tetrominos.getNextPiece();
    expect(tetrominos.bag).toHaveLength(6);
  });
});
