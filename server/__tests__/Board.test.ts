import { Board } from '../src/domain/Board.js';
import { expect, test, describe } from 'vitest';

describe('Board', () => {
  test('createNewBoard', () => {

    const board = new Board();


    expect(board.grid).toHaveLength(20);
    expect(board.grid[0]).toHaveLength(10);
  });

  test('setCurrPiece', () => {

    const board = new Board();


    board.setCurrPiece('I');


    expect(board.currPiece).not.toBeNull();
    expect(board.currPiece?.shape).toBe('I');
  });

  test('moveDown returns true when piece can move', () => {

    const board = new Board();
    board.setCurrPiece('I');


    const result = board.moveCurrPieceDown();


    expect(result).toBe(true);
  });

  test('canMoveCurrPieceDown', () => {

    const board = new Board();
    board.setCurrPiece('I');


    const result = board.canMoveCurrPieceDown();


    expect(result).toBe(true);
  });

  test('clear', () => {

    const board = new Board();
    board.setCurrPiece('I');
    expect(board.grid[0][4]).toBe('I');


    board.clear();


    expect(board.grid[0][4]).toBe('empty');
  });

  test('moveDown changes position', () => {

    const board = new Board();
    board.setCurrPiece('I');
    board.clear();


    board.moveDown();
    board.draw();


    expect(board.grid[1][4]).toBe('I');
  });

  test('lock', () => {

    const board = new Board();
    board.setCurrPiece('I');


    board.lock();


    expect(board.grid[0][4]).toBe('I');
    expect(board.currPiece).toBeNull();
  });

  test('draw', () => {

    const board = new Board();


    board.setCurrPiece('I');


    expect(board.grid[0][4]).toBe('I');
  });

  test('checkCompleteRows', () => {

    const board = new Board();
    const filledRow = () => Array.from({ length: 10 }, () => 'I' as const);
    board.grid = Array.from({ length: 20 }, filledRow);


    const cleared = board.checkCompleteRows();


    expect(cleared).toBe(20);
    expect(board.grid[0]).toEqual(Array.from({ length: 10 }, () => 'empty'));
  });

  test('checkCompleteRows skips penalty rows', () => {

    const board = new Board();
    const filledRow = () => Array.from({ length: 10 }, () => 'I' as const);
    const penaltyRow = () => Array.from({ length: 10 }, () => 'penalty' as const);
    board.grid = Array.from({ length: 20 }, (_, i) => (i === 19 ? penaltyRow() : filledRow()));


    const cleared = board.checkCompleteRows();


    expect(cleared).toBe(19);
    expect(board.grid[19]).toEqual(penaltyRow());
  });

  test('rotateCurrPiece', () => {

    const board = new Board();
    board.setCurrPiece('I');


    board.currPiece?.rotate();


    expect(board.currPiece?.currRotIdx).toBe(1);
  });

  test('canRotateCurrPiece', () => {

    const board = new Board();
    board.setCurrPiece('I');
    board.clear();


    const result = board.canRotateCurrPiece();


    expect(result).toBe(true);
  });

  test('moveHorizontal left', () => {

    const board = new Board();
    board.setCurrPiece('I');


    board.moveHorizontal('left');


    expect(board.position[1]).toBe(3);
  });

  test('canMoveHorizontal left', () => {

    const board = new Board();
    board.setCurrPiece('I');
    board.clear();


    const result = board.canMoveHorizontal('left');


    expect(result).toBe(true);
  });

  test('moveHorizontal right', () => {

    const board = new Board();
    board.setCurrPiece('I');


    board.moveHorizontal('right');


    expect(board.position[1]).toBe(5);
  });

  test('canMoveHorizontal right', () => {

    const board = new Board();
    board.setCurrPiece('I');
    board.clear();


    const result = board.canMoveHorizontal('right');


    expect(result).toBe(true);
  });

  test('cannotMoveHorizontal left when blocked', () => {

    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[0][3] = 'J';


    const result = board.canMoveHorizontal('left');


    expect(result).toBe(false);
  });

  test('cannotMoveHorizontal right when blocked', () => {

    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[0][8] = 'J';


    const result = board.canMoveHorizontal('right');


    expect(result).toBe(false);
  });

  test('pieceCannotMoveDown when blocked', () => {

    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[1][4] = 'J';


    const result = board.moveCurrPieceDown();


    expect(result).toBe(false);
  });

  test('pieceCanMoveDownAfterRotation', () => {

    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[1][4] = 'J';
    board.rotateCurrPiece();


    const result = board.moveCurrPieceDown();


    expect(result).toBe(true);
  });

  test('lockCurrentPiece returns cleared count', () => {

    const board = new Board();
    board.setCurrPiece('I');


    const cleared = board.lockCurrentPiece();


    expect(cleared).toBe(0);
    expect(board.currPiece).toBeNull();
  });

  test('hardMoveDown locks piece at bottom', () => {

    const board = new Board();
    board.setCurrPiece('I');


    const cleared = board.hardMoveDown();


    expect(cleared).toBe(0);
    expect(board.currPiece).toBeNull();
    expect(board.grid[19][4]).toBe('I');
  });

  test('addPenaltyLines', () => {

    const board = new Board();


    board.addPenaltyLines(3);


    expect(board.grid[19].every((c) => c === 'penalty')).toBe(true);
    expect(board.grid[18].every((c) => c === 'penalty')).toBe(true);
    expect(board.grid[17].every((c) => c === 'penalty')).toBe(true);
    expect(board.grid[16].every((c) => c === 'empty')).toBe(true);
    expect(board.grid).toHaveLength(20);
  });

  test('getSpectrum', () => {

    const board = new Board();
    board.grid[19][0] = 'I';
    board.grid[18][0] = 'I';
    board.grid[19][5] = 'J';


    const spectrum = board.getSpectrum();


    expect(spectrum[0]).toBe(2);
    expect(spectrum[5]).toBe(1);
    expect(spectrum[1]).toBe(0);
  });

  test('setCurrPiece returns false when top rows are occupied (game over)', () => {
    const board = new Board();
    board.grid[0][4] = 'J';
    board.grid[0][5] = 'J';
    board.grid[0][6] = 'J';
    board.grid[0][7] = 'J';

    const result = board.setCurrPiece('I');

    expect(result).toBe(false);
  });

  test('canRotateCurrPiece returns false when rotation would exceed grid bottom', () => {
    const board = new Board();
    board.setCurrPiece('T');
    board.clear();
    board.currPiece!.currRotIdx = 0;
    board.position = [18, 4];

    const result = board.canRotateCurrPiece();

    expect(result).toBe(false);
  });

  test('canRotateCurrPiece returns false when rotation would exceed grid right', () => {
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.currPiece!.currRotIdx = 3;
    board.position = [0, 8];

    const result = board.canRotateCurrPiece();

    expect(result).toBe(false);
  });

  test('moveCurrPieceDown does not auto-lock', () => {

    const board = new Board();
    board.setCurrPiece('I');
    while (board.canMoveCurrPieceDown()) {
      board.clear();
      board.moveDown();
      board.draw();
    }


    const result = board.moveCurrPieceDown();


    expect(result).toBe(false);
    expect(board.currPiece).not.toBeNull();
  });
});
