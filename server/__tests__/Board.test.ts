import { Board, GRID_HEIGHT } from '../src/domain/Board.js';
import { expect, test, describe } from 'vitest';

describe('Board', () => {
  test('createNewBoard has 21 rows (1 buffer + 20 visible)', () => {
    const board = new Board();

    expect(board.grid).toHaveLength(21);
    expect(board.grid[0]).toHaveLength(10);
  });

  test('setCurrPiece', () => {
    const board = new Board();

    board.setCurrPiece('I');

    expect(board.currPiece).not.toBeNull();
    expect(board.currPiece?.shape).toBe('I');
  });

  test('setCurrPiece with initial rotation (IRS)', () => {
    const board = new Board();

    board.setCurrPiece('T', 1);

    expect(board.currPiece).not.toBeNull();
    expect(board.currPiece?.currRotIdx).toBe(1);
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
    expect(board.grid[1][4]).toBe('I');

    board.clear();

    expect(board.grid[1][4]).toBe('empty');
  });

  test('moveDown changes position', () => {
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();

    board.moveDown();
    board.draw();

    expect(board.grid[2][4]).toBe('I');
  });

  test('lock', () => {
    const board = new Board();
    board.setCurrPiece('I');

    board.lock();

    expect(board.grid[1][4]).toBe('I');
    expect(board.currPiece).toBeNull();
  });

  test('draw', () => {
    const board = new Board();

    board.setCurrPiece('I');

    expect(board.grid[1][4]).toBe('I');
  });

  test('checkCompleteRows', () => {
    const board = new Board();
    const filledRow = () => Array.from({ length: 10 }, () => 'I' as const);
    board.grid = Array.from({ length: GRID_HEIGHT }, filledRow);

    const cleared = board.checkCompleteRows();

    expect(cleared).toBe(GRID_HEIGHT);
    expect(board.grid[0]).toEqual(Array.from({ length: 10 }, () => 'empty'));
  });

  test('checkCompleteRows skips penalty rows', () => {
    const board = new Board();
    const filledRow = () => Array.from({ length: 10 }, () => 'I' as const);
    const penaltyRow = () => Array.from({ length: 10 }, () => 'penalty' as const);
    board.grid = Array.from({ length: GRID_HEIGHT }, (_, i) => (i === GRID_HEIGHT - 1 ? penaltyRow() : filledRow()));

    const cleared = board.checkCompleteRows();

    expect(cleared).toBe(GRID_HEIGHT - 1);
    expect(board.grid[GRID_HEIGHT - 1]).toEqual(penaltyRow());
  });

  test('markCompleteRows counts without removing', () => {
    const board = new Board();
    const filledRow = () => Array.from({ length: 10 }, () => 'I' as const);
    const emptyRow = () => Array.from({ length: 10 }, () => 'empty' as const);
    board.grid = Array.from({ length: GRID_HEIGHT }, (_, i) => (i >= GRID_HEIGHT - 2 ? filledRow() : emptyRow()));

    const count = board.markCompleteRows();

    expect(count).toBe(2);
    expect(board.grid[GRID_HEIGHT - 1].every((c) => c === 'I')).toBe(true);
    expect(board.grid[GRID_HEIGHT - 2].every((c) => c === 'I')).toBe(true);
  });

  test('removeMarkedRows removes complete rows', () => {
    const board = new Board();
    const filledRow = () => Array.from({ length: 10 }, () => 'I' as const);
    const emptyRow = () => Array.from({ length: 10 }, () => 'empty' as const);
    board.grid = Array.from({ length: GRID_HEIGHT }, (_, i) => (i >= GRID_HEIGHT - 2 ? filledRow() : emptyRow()));

    const cleared = board.removeMarkedRows();

    expect(cleared).toBe(2);
    expect(board.grid[GRID_HEIGHT - 1].every((c) => c === 'empty')).toBe(true);
  });

  test('isBoardEmpty returns true for empty board', () => {
    const board = new Board();

    expect(board.isBoardEmpty()).toBe(true);
  });

  test('isBoardEmpty returns false when board has pieces', () => {
    const board = new Board();
    board.grid[GRID_HEIGHT - 1][0] = 'I';

    expect(board.isBoardEmpty()).toBe(false);
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
    board.grid[1][3] = 'J';

    const result = board.canMoveHorizontal('left');

    expect(result).toBe(false);
  });

  test('cannotMoveHorizontal right when blocked', () => {
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[1][8] = 'J';

    const result = board.canMoveHorizontal('right');

    expect(result).toBe(false);
  });

  test('pieceCannotMoveDown when blocked', () => {
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[2][4] = 'J';

    const result = board.moveCurrPieceDown();

    expect(result).toBe(false);
  });

  test('pieceCanMoveDownAfterRotation', () => {
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.grid[2][4] = 'J';
    board.rotateCurrPiece();

    const result = board.moveCurrPieceDown();

    expect(result).toBe(true);
  });

  test('lockCurrentPiece nulls currPiece', () => {
    const board = new Board();
    board.setCurrPiece('I');

    board.lockCurrentPiece();

    expect(board.currPiece).toBeNull();
  });

  test('hardMoveDown locks piece at bottom', () => {
    const board = new Board();
    board.setCurrPiece('I');

    board.hardMoveDown();

    expect(board.currPiece).toBeNull();
    expect(board.grid[GRID_HEIGHT - 1][4]).toBe('I');
  });

  test('hardMoveDown returns drop distance', () => {
    const board = new Board();
    board.setCurrPiece('I');

    const distance = board.hardMoveDown();

    expect(distance).toBe(19);
  });

  test('addPenaltyLines preserves buffer row', () => {
    const board = new Board();

    board.addPenaltyLines(3);

    expect(board.grid[GRID_HEIGHT - 1].every((c) => c === 'penalty')).toBe(true);
    expect(board.grid[GRID_HEIGHT - 2].every((c) => c === 'penalty')).toBe(true);
    expect(board.grid[GRID_HEIGHT - 3].every((c) => c === 'penalty')).toBe(true);
    expect(board.grid[GRID_HEIGHT - 4].every((c) => c === 'empty')).toBe(true);
    expect(board.grid).toHaveLength(GRID_HEIGHT);
  });

  test('getSpectrum uses visible rows only (rows 1-20)', () => {
    const board = new Board();
    board.grid[GRID_HEIGHT - 1][0] = 'I';
    board.grid[GRID_HEIGHT - 2][0] = 'I';
    board.grid[GRID_HEIGHT - 1][5] = 'J';

    const spectrum = board.getSpectrum();

    expect(spectrum[0]).toBe(2);
    expect(spectrum[5]).toBe(1);
    expect(spectrum[1]).toBe(0);
  });

  test('toPayload returns 20 rows (excludes buffer)', () => {
    const board = new Board();

    const payload = board.toPayload();

    expect(payload).toHaveLength(20);
  });

  test('setCurrPiece returns false when top rows are occupied (game over)', () => {
    const board = new Board();
    board.grid[1][4] = 'J';
    board.grid[1][5] = 'J';
    board.grid[1][6] = 'J';
    board.grid[1][7] = 'J';

    const result = board.setCurrPiece('I');

    expect(result).toBe(false);
  });

  test('canRotateCurrPiece returns false when rotation would exceed grid bottom', () => {
    const board = new Board();
    board.setCurrPiece('T');
    board.clear();
    board.currPiece!.currRotIdx = 0;
    board.position = [GRID_HEIGHT - 2, 4];

    const result = board.canRotateCurrPiece();

    expect(result).toBe(false);
  });

  test('canRotateCurrPiece returns false for I-piece when rotation would exceed grid right', () => {
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.currPiece!.currRotIdx = 1;
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

  test('T-piece wall kicks right when blocked on the left', () => {
    const board = new Board();
    board.setCurrPiece('T');
    board.clear();
    board.currPiece!.currRotIdx = 1;
    board.position = [5, 4];
    board.grid[7][4] = 'J';

    board.rotateCurrPiece();

    expect(board.currPiece!.currRotIdx).toBe(2);
    expect(board.position[1]).toBe(5);
  });

  test('T-piece wall kicks left when against right wall', () => {
    const board = new Board();
    board.setCurrPiece('T');
    board.clear();
    board.position = [5, 8];
    board.rotateCurrPiece();

    expect(board.currPiece!.currRotIdx).toBe(1);
    expect(board.position[1]).toBe(7);
  });

  test('I-piece does not wall kick', () => {
    const board = new Board();
    board.setCurrPiece('I');
    board.clear();
    board.position = [0, 8];
    board.rotateCurrPiece();

    expect(board.currPiece!.currRotIdx).toBe(0);
    expect(board.position[1]).toBe(8);
  });

  test('O-piece does not rotate', () => {
    const board = new Board();
    board.setCurrPiece('O');
    const initialRotIdx = board.currPiece!.currRotIdx;

    board.rotateCurrPiece();

    expect(board.currPiece!.currRotIdx).toBe(initialRotIdx);
  });

  test('S-piece toggles between 2 states', () => {
    const board = new Board();
    board.setCurrPiece('S');
    board.clear();
    board.position = [5, 4];

    board.rotateCurrPiece();
    expect(board.currPiece!.currRotIdx).toBe(1);

    board.rotateCurrPiece();
    expect(board.currPiece!.currRotIdx).toBe(0);
  });

  test('Z-piece toggles between 2 states', () => {
    const board = new Board();
    board.setCurrPiece('Z');
    board.clear();
    board.position = [5, 4];

    board.rotateCurrPiece();
    expect(board.currPiece!.currRotIdx).toBe(1);

    board.rotateCurrPiece();
    expect(board.currPiece!.currRotIdx).toBe(0);
  });

  test('S-piece wall kicks when near wall', () => {
    const board = new Board();
    board.setCurrPiece('S');
    board.clear();
    board.position = [5, 8];
    board.rotateCurrPiece();

    expect(board.currPiece!.currRotIdx).toBe(1);
  });

  test('center column rule blocks kick for T-piece', () => {
    const board = new Board();
    board.setCurrPiece('T');
    board.clear();
    board.position = [5, 4];
    board.grid[5][5] = 'J';

    board.rotateCurrPiece();

    expect(board.currPiece!.currRotIdx).toBe(0);
  });
});
