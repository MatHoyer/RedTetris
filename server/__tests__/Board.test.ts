import { Board } from '../src/game/Board.js';
import { expect, test, describe } from 'vitest';

describe('Board', () => {
  test('createNewBoard', () => {
    // When
    const board = new Board();

    // Then
    expect(board.grid).toHaveLength(20);
    expect(board.grid[0]).toHaveLength(10);
  });

  test('setCurrPiece', () => {
    // Given
    const board = new Board();

    // When
    board.setCurrPiece('I');

    // Then
    expect(board.currPiece).not.toBeNull();
    expect(board.currPiece?.shape).toBe('I');
  });

  test('moveDown returns true when piece can move', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');

    // When
    const result = board.moveCurrPieceDown();

    // Then
    expect(result).toBe(true);
  });

  test('canMoveCurrPieceDown', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');

    // When
    const result = board.canMoveCurrPieceDown();

    // Then
    expect(result).toBe(true);
  });

  test('clear', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    expect(board.grid[0][4]).toBe('I');

    // When
    board.clear();

    // Then
    expect(board.grid[0][4]).toBe('empty');
  });

  test('moveDown changes position', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();

    // When
    board.moveDown();
    board.draw();

    // Then
    expect(board.grid[1][4]).toBe('I');
  });

  test('lock', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');

    // When
    board.lock();

    // Then
    expect(board.grid[0][4]).toBe('I');
    expect(board.currPiece).toBeNull();
  });

  test('draw', () => {
    // Given
    const board = new Board();

    // When
    board.setCurrPiece('I');

    // Then
    expect(board.grid[0][4]).toBe('I');
  });

  test('checkCompleteRows', () => {
    // Given
    const board = new Board();
    const filledRow = () => Array.from({ length: 10 }, () => 'I' as const);
    board.grid = Array.from({ length: 20 }, filledRow);

    // When
    const cleared = board.checkCompleteRows();

    // Then
    expect(cleared).toBe(20);
    expect(board.grid[0]).toEqual(Array.from({ length: 10 }, () => 'empty'));
  });

  test('checkCompleteRows skips penalty rows', () => {
    // Given
    const board = new Board();
    const filledRow = () => Array.from({ length: 10 }, () => 'I' as const);
    const penaltyRow = () => Array.from({ length: 10 }, () => 'penalty' as const);
    board.grid = Array.from({ length: 20 }, (_, i) => (i === 19 ? penaltyRow() : filledRow()));

    // When
    const cleared = board.checkCompleteRows();

    // Then
    expect(cleared).toBe(19);
    expect(board.grid[19]).toEqual(penaltyRow());
  });

  test('rotateCurrPiece', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');

    // When
    board.currPiece?.rotate();

    // Then
    expect(board.currPiece?.currRotIdx).toBe(1);
  });

  test('canRotateCurrPiece', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();

    // When
    const result = board.canRotateCurrPiece();

    // Then
    expect(result).toBe(true);
  });

  test('moveHorizontal left', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');

    // When
    board.moveHorizontal('left');

    // Then
    expect(board.position[1]).toBe(3);
  });

  test('canMoveHorizontal left', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();

    // When
    const result = board.canMoveHorizontal('left');

    // Then
    expect(result).toBe(true);
  });

  test('moveHorizontal right', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');

    // When
    board.moveHorizontal('right');

    // Then
    expect(board.position[1]).toBe(5);
  });

  test('canMoveHorizontal right', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();

    // When
    const result = board.canMoveHorizontal('right');

    // Then
    expect(result).toBe(true);
  });

  test('cannotMoveHorizontal left when blocked', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[0][3] = 'J';

    // When
    const result = board.canMoveHorizontal('left');

    // Then
    expect(result).toBe(false);
  });

  test('cannotMoveHorizontal right when blocked', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[0][8] = 'J';

    // When
    const result = board.canMoveHorizontal('right');

    // Then
    expect(result).toBe(false);
  });

  test('pieceCannotMoveDown when blocked', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[1][4] = 'J';

    // When
    const result = board.moveCurrPieceDown();

    // Then
    expect(result).toBe(false);
  });

  test('pieceCanMoveDownAfterRotation', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[1][4] = 'J';
    board.rotateCurrPiece();

    // When
    const result = board.moveCurrPieceDown();

    // Then
    expect(result).toBe(true);
  });

  test('lockCurrentPiece returns cleared count', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');

    // When
    const cleared = board.lockCurrentPiece();

    // Then
    expect(cleared).toBe(0);
    expect(board.currPiece).toBeNull();
  });

  test('hardMoveDown locks piece at bottom', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');

    // When
    const cleared = board.hardMoveDown();

    // Then
    expect(cleared).toBe(0);
    expect(board.currPiece).toBeNull();
    expect(board.grid[19][4]).toBe('I');
  });

  test('addPenaltyLines', () => {
    // Given
    const board = new Board();

    // When
    board.addPenaltyLines(3);

    // Then
    expect(board.grid[19].every((c) => c === 'penalty')).toBe(true);
    expect(board.grid[18].every((c) => c === 'penalty')).toBe(true);
    expect(board.grid[17].every((c) => c === 'penalty')).toBe(true);
    expect(board.grid[16].every((c) => c === 'empty')).toBe(true);
    expect(board.grid).toHaveLength(20);
  });

  test('getSpectrum', () => {
    // Given
    const board = new Board();
    board.grid[19][0] = 'I';
    board.grid[18][0] = 'I';
    board.grid[19][5] = 'J';

    // When
    const spectrum = board.getSpectrum();

    // Then
    expect(spectrum[0]).toBe(2);
    expect(spectrum[5]).toBe(1);
    expect(spectrum[1]).toBe(0);
  });

  test('moveCurrPieceDown does not auto-lock', () => {
    // Given
    const board = new Board();
    board.setCurrPiece('I');
    while (board.canMoveCurrPieceDown()) {
      board.clear();
      board.moveDown();
      board.draw();
    }

    // When
    const result = board.moveCurrPieceDown();

    // Then
    expect(result).toBe(false);
    expect(board.currPiece).not.toBeNull();
  });
});
