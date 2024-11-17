import { Board } from '../src/game/Board.js';
import { expect, test, describe } from 'vitest';

describe('Board', () => {
  test('createNewBoard', () => {
    // given
    const board = new Board();
    // when
    // then
    expect(board.grid).toHaveLength(20);
    expect(board.grid[0]).toHaveLength(10);
  });

  test('setCurrPiece', () => {
    // given
    const board = new Board();
    // when
    board.setCurrPiece('I');
    // then
    expect(board.currPiece).not.toBeNull();
    expect(board.currPiece?.shape).toBe('I');
  });

  test('moveDown', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    const result = board.moveCurrPieceDown();
    // then
    expect(result).toBe(true);
  });

  test('canMoveCurrPieceDown', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    const result = board.canMoveCurrPieceDown();
    // then
    expect(result).toBe(true);
  });

  test('clear', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    board.clear();
    // then
    expect(board.grid[0][4]).toBe(0);
  });

  test('moveDown', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    board.moveDown();
    // then
    expect(board.grid[1][4]).toBe(1);
  });

  test('lock', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    board.lock();
    // then
    expect(board.grid[0][4]).toBe(1);
  });

  test('draw', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    board.draw();
    // then
    expect(board.grid[0][4]).toBe(1);
  });

  test('checkCompleteRows', () => {
    // given
    const board = new Board();
    board.grid = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
    // when
    board.checkCompleteRows();
    // then
    expect(board.grid[0]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  test('rotateCurrPiece', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    board.currPiece?.rotate();
    // then
    expect(board.currPiece?.currRotIdx).toBe(1);
  });

  test('canRotateCurrPiece', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    const result = board.canRotateCurrPiece();
    // then
    expect(result).toBe(true);
  });

  test('moveHorizontal', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    board.moveHorizontal('left');
    // then
    expect(board.position[1]).toBe(3);
  });

  test('canMoveHorizontal', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    const result = board.canMoveHorizontal('left');
    // then
    expect(result).toBe(true);
  });

  test('moveHorizontal', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    board.moveHorizontal('right');
    // then
    expect(board.position[1]).toBe(5);
    expect(board.grid[0][4]).toBe(0);
  });

  test('canMoveHorizontal', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    // when
    const result = board.canMoveHorizontal('right');
    // then
    expect(result).toBe(true);
  });

  test('cannotMoveHorizontal', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    board.grid[0][3] = 1;
    // when
    const result = board.canMoveHorizontal('left');
    // then
    expect(result).toBe(false);
  });

  test('cannotMoveHorizontal', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    board.grid[0][5] = 1;
    // when
    const result = board.canMoveHorizontal('right');
    // then
    expect(result).toBe(false);
  });

  test('pieceCannotMoveDown', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    board.grid[1][4] = 1;
    // when
    const result = board.moveCurrPieceDown();
    // then
    expect(result).toBe(false);
  });

  test('pieceCannotMoveDownUnlessRotated', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    board.grid[1][4] = 1;
    // when
    board.rotateCurrPiece();
    const result = board.moveCurrPieceDown();
    // then
    expect(result).toBe(true);
  });

  test('pieceCannotBottomOut', () => {
    // given
    const board = new Board();
    board.setCurrPiece('I');
    board.grid[18][4] = 1;
    // when
    board.position = [18, 4];
    const result = board.moveCurrPieceDown();
    // then
    expect(result).toBe(false);
  });
});
