import { Tetrominos } from '../src/game/Tetrominos.js';
import { tetrominoes } from '../../events/index.js';
import { expect, test, describe } from 'vitest';

describe('Tetrominos', () => {
  test('constructor creates initial bag with 2 pieces', () => {
    // When
    const tetrominos = new Tetrominos();

    // Then
    expect(tetrominos.bag).toHaveLength(2);
  });

  test('refillBag adds a piece', () => {
    // Given
    const tetrominos = new Tetrominos();
    const initialLength = tetrominos.bag.length;

    // When
    tetrominos.refillBag();

    // Then
    expect(tetrominos.bag).toHaveLength(initialLength + 1);
  });

  test('getPiece returns current and next', () => {
    // Given
    const tetrominos = new Tetrominos();

    // When
    const { current, next } = tetrominos.getPiece(0);

    // Then
    expect(tetrominoes).toContain(current);
    expect(tetrominoes).toContain(next);
  });

  test('getPiece refills bag when near end', () => {
    // Given
    const tetrominos = new Tetrominos();
    const initialLength = tetrominos.bag.length;

    // When
    tetrominos.getPiece(0);

    // Then
    expect(tetrominos.bag.length).toBe(initialLength + 1);
  });
});
