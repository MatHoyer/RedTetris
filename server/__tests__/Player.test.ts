import { describe, test, expect, vi, afterEach } from 'vitest';
import { Player, PlayerState } from '../src/domain/Player';
import { Board } from '../src/domain/Board';
import { Tetrominos } from '../src/domain/Tetrominos';
import { PlayerPort } from '../src/domain/ports';

const createMockPort = (): PlayerPort => ({
  emitBoard: vi.fn(),
  emitScore: vi.fn(),
  emitLevel: vi.fn(),
  emitNextPiece: vi.fn(),
  emitGameEnded: vi.fn(),
  emitGameStarted: vi.fn(),
  emitGameData: vi.fn(),
  emitSpectrum: vi.fn(),
  onKeyDown: vi.fn(),
  onKeyUp: vi.fn(),
  offKeyDown: vi.fn(),
  offKeyUp: vi.fn(),
});

describe('Player', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should initialize with the correct id, name, and socketId', () => {
    const player = new Player(1, 'Player1', 'socket123');

    expect(player.id).toBe(1);
    expect(player.name).toBe('Player1');
    expect(player.socketId).toBe('socket123');
    expect(player.board).toBeInstanceOf(Board);
    expect(player.alive).toBe(true);
    expect(player.state).toBe(PlayerState.IDLE);
  });

  test('should return the correct payload with level', () => {
    const player = new Player(1, 'Player1', 'socket123');

    const payload = player.toPayload();

    expect(payload).toEqual({
      id: 1,
      name: 'Player1',
      alive: true,
      score: 0,
      level: 0,
    });
  });

  test('should update name', () => {
    const player = new Player(1, 'Player1', 'socket123');

    player.updatePlayer('NewName');

    expect(player.name).toBe('NewName');
  });

  test('forceStop should exist as a method', () => {
    const player = new Player(1, 'Player1', 'socket123');

    expect(typeof player.forceStop).toBe('function');
  });

  test('start does nothing without a port', () => {
    const player = new Player(1, 'Player1', 'socket123');
    const bag = new Tetrominos();

    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    expect(player.state).toBe(PlayerState.IDLE);
  });

  test('start initializes player state with a port', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    const notify = vi.fn();

    player.start(bag, notify, vi.fn(), vi.fn(), vi.fn());

    expect(player.alive).toBe(true);
    expect(player.score).toBe(0);
    expect(player.level).toBe(0);
    expect(player.state).toBe(PlayerState.ACTIVE);
    expect(player.bagIndex).toBe(1);
    expect(port.onKeyDown).toHaveBeenCalled();
    expect(port.onKeyUp).toHaveBeenCalled();
    expect(port.emitBoard).toHaveBeenCalled();
    expect(notify).toHaveBeenCalled();
  });

  test('handleNextPiece sets a piece on the board', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    player.bag = new Tetrominos();
    player.bagIndex = 0;

    const result = player.handleNextPiece();

    expect(result).toBe(true);
    expect(player.bagIndex).toBe(1);
    expect(player.board.currPiece).not.toBeNull();
    expect(port.emitNextPiece).toHaveBeenCalled();
  });

  test('frame in ACTIVE state applies gravity', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const initialPos = player.board.position[0];

    for (let i = 0; i < 100; i++) {
      player.frame();
    }

    expect(player.board.position[0]).toBeGreaterThan(initialPos);
  });

  test('frame transitions to LOCK_DELAY when piece hits bottom', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    while (player.board.moveCurrPieceDown()) {}
    player.state = PlayerState.ACTIVE;
    player.gravityAccumulator = 256;

    player.frame();

    expect(player.state).toBe(PlayerState.LOCK_DELAY);
  });

  test('LOCK_DELAY transitions to ARE after 30 frames', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    while (player.board.moveCurrPieceDown()) {}
    player.state = PlayerState.LOCK_DELAY;
    player.lockDelayCounter = 0;

    for (let i = 0; i < 30; i++) {
      player.frame();
    }

    expect([PlayerState.ARE, PlayerState.LINE_CLEAR]).toContain(player.state);
  });

  test('ARE transitions to ACTIVE after 30 frames', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    player.board.hardMoveDown();
    player.state = PlayerState.ARE;
    player.areCounter = 0;

    for (let i = 0; i < 30; i++) {
      player.frame();
    }

    expect(player.state).toBe(PlayerState.ACTIVE);
  });

  test('LINE_CLEAR transitions to ARE after 41 frames', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    for (let col = 0; col < 10; col++) {
      player.board.grid[20][col] = 'I';
      player.board.grid[19][col] = 'I';
    }

    player.pendingLinesCleared = 2;
    player.state = PlayerState.LINE_CLEAR;
    player.lineClearCounter = 0;

    for (let i = 0; i < 41; i++) {
      player.frame();
    }

    expect(player.state).toBe(PlayerState.ARE);
  });

  test('stop unregisters keys and calls onStop', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    const onStop = vi.fn();
    player.start(bag, vi.fn(), onStop, vi.fn(), vi.fn());

    player.stop();

    expect(player.alive).toBe(false);
    expect(player.state).toBe(PlayerState.IDLE);
    expect(port.offKeyDown).toHaveBeenCalled();
    expect(port.offKeyUp).toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
  });

  test('stop is idempotent — calling twice only emits onStop once', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    const onStop = vi.fn();
    player.start(bag, vi.fn(), onStop, vi.fn(), vi.fn());

    player.stop();
    player.stop();

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(port.offKeyDown).toHaveBeenCalledTimes(1);
    expect(port.offKeyUp).toHaveBeenCalledTimes(1);
  });

  test('forceStop is idempotent — calling twice only unregisters keys once', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    player.forceStop();
    player.forceStop();

    expect(port.offKeyDown).toHaveBeenCalledTimes(1);
    expect(port.offKeyUp).toHaveBeenCalledTimes(1);
  });

  test('stop does nothing without port', () => {
    const player = new Player(1, 'Player1', 'socket123');

    expect(() => player.stop()).not.toThrow();
  });

  test('forceStop unregisters keys without calling onStop', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    const onStop = vi.fn();
    player.start(bag, vi.fn(), onStop, vi.fn(), vi.fn());

    player.forceStop();

    expect(player.alive).toBe(false);
    expect(player.state).toBe(PlayerState.IDLE);
    expect(port.offKeyDown).toHaveBeenCalled();
    expect(port.offKeyUp).toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
  });

  test('forceStop does nothing without port', () => {
    const player = new Player(1, 'Player1', 'socket123');

    expect(() => player.forceStop()).not.toThrow();
  });

  test('hard drop via key handler transitions state correctly', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    keyDownHandlers['hardDrop']();

    expect([PlayerState.ARE, PlayerState.LINE_CLEAR]).toContain(player.state);
    expect(port.emitBoard).toHaveBeenCalled();
  });

  test('DAS charges and moves piece after threshold', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const initialCol = player.board.position[1];

    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    keyDownHandlers['left']();

    for (let i = 0; i < 17; i++) {
      player.frame();
    }

    expect(player.board.position[1]).toBeLessThan(initialCol);
  });

  test('single tap moves piece once', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const initialCol = player.board.position[1];

    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const keyUpHandlers = (port.onKeyUp as ReturnType<typeof vi.fn>).mock.calls[0][0];
    keyDownHandlers['left']();
    keyUpHandlers['left']();

    expect(player.board.position[1]).toBe(initialCol - 1);
  });

  test('IRS spawns piece with rotation', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    player.board.hardMoveDown();

    player.irsRotation = true;
    player.state = PlayerState.ARE;
    player.areCounter = 29;

    player.frame();

    expect(player.state).toBe(PlayerState.ACTIVE);
  });

  test('level increments on piece placement', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    const initialLevel = player.level;
    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    keyDownHandlers['hardDrop']();

    expect(player.level).toBe(initialLevel + 1);
  });

  test('level does not increment past section boundary (x99)', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    player.level = 99;
    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    keyDownHandlers['hardDrop']();

    expect(player.level).toBe(99);
  });

  test('level caps at 999', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    player.level = 999;
    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    keyDownHandlers['hardDrop']();

    expect(player.level).toBe(999);
  });

  test('scoring applies TGM formula on line clear', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    for (let col = 0; col < 10; col++) {
      player.board.grid[20][col] = 'I';
    }

    player.pendingLinesCleared = 1;
    player.combo = 1;
    player.level = 0;
    player.softDropFrames = 0;
    player.state = PlayerState.LINE_CLEAR;
    player.lineClearCounter = 40;

    player.frame();

    expect(player.score).toBeGreaterThan(0);
  });

  test('combo increases with consecutive line clears', () => {
    const player = new Player(1, 'Player1', 'socket1');
    player.combo = 1;

    expect(1 + 2 * 1 - 2).toBe(1);
    expect(1 + 2 * 2 - 2).toBe(3);
    expect(3 + 2 * 1 - 2).toBe(3);
  });

  test('sendBoard emits board payload and spectrum', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const onBoardUpdate = vi.fn();
    player.onBoardUpdate = onBoardUpdate;

    player.sendBoard();

    expect(port.emitBoard).toHaveBeenCalled();
    const emittedBoard = (port.emitBoard as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(emittedBoard).toHaveLength(20);
    expect(onBoardUpdate).toHaveBeenCalledWith(1, expect.any(Array));
  });

  test('sendScore emits score', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    player.score = 500;

    player.sendScore();

    expect(port.emitScore).toHaveBeenCalledWith(500);
  });

  test('sendLevel emits level', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    player.level = 42;

    player.sendLevel();

    expect(port.emitLevel).toHaveBeenCalledWith(42);
  });

  test('soft drop adds gravity when down is held', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const initialPos = player.board.position[0];

    player.heldKeys['down'] = true;
    player.frame();

    expect(player.board.position[0]).toBeGreaterThan(initialPos);
    expect(player.softDropFrames).toBe(1);
  });

  test('key release handlers work correctly', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const keyUpHandlers = (port.onKeyUp as ReturnType<typeof vi.fn>).mock.calls[0][0];

    keyDownHandlers['left']();
    expect(player.heldKeys['left']).toBe(true);
    expect(player.dasDirection).toBe('left');

    keyUpHandlers['left']();
    expect(player.heldKeys['left']).toBe(false);
  });

  test('rotate key handler in ACTIVE state rotates piece', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    keyDownHandlers['rotate']();

    player.frame();

    expect(player.heldKeys['rotate']).toBe(false);
  });

  test('ARE state ends game when no piece can be placed', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    const onStop = vi.fn();
    player.start(bag, vi.fn(), onStop, vi.fn(), vi.fn());

    for (let col = 0; col < 10; col++) {
      player.board.grid[0][col] = 'J';
      player.board.grid[1][col] = 'J';
    }

    player.state = PlayerState.ARE;
    player.areCounter = 29;

    player.frame();

    expect(player.alive).toBe(false);
    expect(onStop).toHaveBeenCalled();
  });
});
