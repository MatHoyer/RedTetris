import { describe, it, expect } from 'vitest';
import { Piece } from '../src/game/Piece';

describe('Piece', () => {
  it('should initialize with the correct shape and configurations', () => {
    // Given
    const shape = 'T';
    const configs = [
      [
        [0, 1, 0],
        [1, 1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 0],
      ],
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [0, 1],
      ],
    ];

    // When
    const piece = new Piece(shape, configs);

    // Then
    expect(piece.shape).toBe(shape);
    expect(piece.configs).toEqual(configs);
    expect(piece.currRotIdx).toBe(0);
  });

  it('should rotate clockwise', () => {
    // Given
    const piece = new Piece('T', [
      [
        [0, 1, 0],
        [1, 1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 0],
      ],
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [0, 1],
      ],
    ]);

    // When
    piece.rotate();

    // Then
    expect(piece.currRotIdx).toBe(1);
    expect(piece.getCurrentConfig()).toEqual([
      [1, 0],
      [1, 1],
      [1, 0],
    ]);
  });

  it('should rotate counterclockwise', () => {
    // Given
    const piece = new Piece('T', [
      [
        [0, 1, 0],
        [1, 1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 0],
      ],
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [0, 1],
      ],
    ]);

    // When
    piece.rotate(false);

    // Then
    expect(piece.currRotIdx).toBe(3);
    expect(piece.getCurrentConfig()).toEqual([
      [0, 1],
      [1, 1],
      [0, 1],
    ]);
  });

  it('should return the current configuration', () => {
    // Given
    const configs = [
      [
        [0, 1, 0],
        [1, 1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 0],
      ],
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [0, 1],
      ],
    ];
    const piece = new Piece('T', configs);

    // When
    const currentConfig = piece.getCurrentConfig();

    // Then
    expect(currentConfig).toEqual(configs[0]);
  });
});
