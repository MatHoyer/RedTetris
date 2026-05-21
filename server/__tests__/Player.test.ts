import { describe, test, expect, vi, afterEach } from 'vitest';
import { Player, PlayerState } from '../src/domain/Player';
import { Board } from '../src/domain/Board';
import { Tetrominos } from '../src/domain/Tetrominos';
import { PlayerPort } from '../src/domain/ports';

const createMockPort = (): PlayerPort => ({
  emitBoard: vi.fn(),
  emitScore: vi.fn(),
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

  test('should return the correct payload', () => {
    const player = new Player(1, 'Player1', 'socket123');

    const payload = player.toPayload();

    expect(payload).toEqual({
      id: 1,
      name: 'Player1',
      alive: true,
      score: 0,
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
    expect(player.board.currentPiece).not.toBeNull();
    expect(port.emitNextPiece).toHaveBeenCalled();
  });

  test('tick in ACTIVE state applies gravity', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const initialPos = player.board.position[0];

    for (let i = 0; i < 100; i++) {
      player.tick();
    }

    expect(player.board.position[0]).toBeGreaterThan(initialPos);
  });

  test('tick transitions to LOCK_DELAY when piece hits bottom', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    while (player.board.moveCurrentPieceDown()) {}
    player.state = PlayerState.ACTIVE;
    player.fallProgress = 256;

    player.tick();

    expect(player.state).toBe(PlayerState.LOCK_DELAY);
  });

  test('LOCK_DELAY spawns next piece after 30 ticks', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const initialBagIndex = player.bagIndex;

    while (player.board.moveCurrentPieceDown()) {}
    player.state = PlayerState.LOCK_DELAY;
    player.lockDelayCounter = 0;

    for (let i = 0; i < 30; i++) {
      player.tick();
    }

    expect(player.state).toBe(PlayerState.ACTIVE);
    expect(player.bagIndex).toBe(initialBagIndex + 1);
  });

  test('line clears are resolved without a line clear delay state', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    const onLinesCleared = vi.fn();
    player.start(bag, vi.fn(), vi.fn(), onLinesCleared, vi.fn());

    player.board.hardMoveDown();
    for (let col = 0; col < 10; col++) {
      player.board.grid[20][col] = 'I';
      player.board.grid[19][col] = 'I';
    }

    player.state = PlayerState.LOCK_DELAY;
    player.lockDelayCounter = 29;
    player.tick();

    expect(player.state).toBe(PlayerState.ACTIVE);
    expect(player.score).toBe(2);
    expect(onLinesCleared).toHaveBeenCalledWith(2);
  });

  test('single line clear sends multiplayer penalty immediately', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    const onLinesCleared = vi.fn();
    player.start(bag, vi.fn(), vi.fn(), onLinesCleared, vi.fn());

    player.board.hardMoveDown();
    for (let col = 0; col < 10; col++) {
      player.board.grid[20][col] = 'I';
    }

    player.state = PlayerState.LOCK_DELAY;
    player.lockDelayCounter = 29;
    player.tick();

    expect(onLinesCleared).toHaveBeenCalledWith(1);
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

    expect(player.state).toBe(PlayerState.ACTIVE);
    expect(port.emitBoard).toHaveBeenCalled();
  });

  test('held horizontal movement does not repeat before DAS charge', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const initialCol = player.board.position[1];

    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    keyDownHandlers['left']();

    for (let i = 0; i < 9; i++) {
      player.tick();
    }

    expect(player.board.position[1]).toBe(initialCol - 1);
  });

  test('held horizontal movement repeats after DAS charge', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const initialCol = player.board.position[1];

    const keyDownHandlers = (port.onKeyDown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    keyDownHandlers['left']();

    for (let i = 0; i < 12; i++) {
      player.tick();
    }

    expect(player.board.position[1]).toBeLessThan(initialCol - 1);
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

  test('scoring adds one point per cleared line', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    player.board.hardMoveDown();
    for (let col = 0; col < 10; col++) {
      player.board.grid[20][col] = 'I';
    }

    player.state = PlayerState.LOCK_DELAY;
    player.lockDelayCounter = 29;
    player.tick();

    expect(player.score).toBe(1);
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

  test('soft drop adds gravity when down is held', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const initialPos = player.board.position[0];

    player.heldKeys['down'] = true;
    player.tick();

    expect(player.board.position[0]).toBeGreaterThan(initialPos);
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

    player.tick();

    expect(player.heldKeys['rotate']).toBe(false);
  });

  test('game ends when the next piece cannot be placed', () => {
    const port = createMockPort();
    const player = new Player(1, 'Player1', 'socket1', port);
    const bag = new Tetrominos();
    const onStop = vi.fn();
    player.start(bag, vi.fn(), onStop, vi.fn(), vi.fn());

    player.board.hardMoveDown();
    for (let col = 4; col <= 7; col++) {
      player.board.grid[1][col] = 'J';
    }

    player.state = PlayerState.LOCK_DELAY;
    player.lockDelayCounter = 29;
    player.tick();

    expect(player.alive).toBe(false);
    expect(onStop).toHaveBeenCalled();
  });
});
