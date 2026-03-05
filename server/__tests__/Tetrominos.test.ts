import { Tetrominos } from '../src/domain/Tetrominos.js';
import { tetrominoes } from '../../events/index.js';
import { expect, test, describe } from 'vitest';

describe('Tetrominos', () => {
  test('constructor creates initial bag with 2 full bags (14 pieces)', () => {

    const tetrominos = new Tetrominos();


    expect(tetrominos.bag).toHaveLength(14);
  });

  test('refillBag adds 7 pieces (a full bag)', () => {

    const tetrominos = new Tetrominos();
    const initialLength = tetrominos.bag.length;


    tetrominos.refillBag();


    expect(tetrominos.bag).toHaveLength(initialLength + 7);
  });

  test('each 7-bag contains all 7 tetrominoes exactly once', () => {

    const tetrominos = new Tetrominos();


    const firstBag = tetrominos.bag.slice(0, 7).sort();
    const secondBag = tetrominos.bag.slice(7, 14).sort();
    const sorted = [...tetrominoes].sort();

    expect(firstBag).toEqual(sorted);
    expect(secondBag).toEqual(sorted);
  });

  test('getPiece returns current and next', () => {

    const tetrominos = new Tetrominos();


    const { current, next } = tetrominos.getPiece(0);


    expect(tetrominoes).toContain(current);
    expect(tetrominoes).toContain(next);
  });

  test('getPiece refills bag when near end', () => {

    const tetrominos = new Tetrominos();
    const initialLength = tetrominos.bag.length;


    tetrominos.getPiece(initialLength - 2);


    expect(tetrominos.bag.length).toBe(initialLength + 7);
  });
});
