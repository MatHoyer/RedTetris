import { describe, test, expect, vi, afterEach } from 'vitest';
import { Player } from '../src/game/Player';
import { Board } from '../src/game/Board';
import { Tetrominos } from '../src/game/Tetrominos';
import { Events } from '../../events/index';

const createMockSocket = () => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
});

describe('Player', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should initialize with the correct id, name, and socketId', () => {
    // When
    const player = new Player(1, 'Player1', 'socket123');

    // Then
    expect(player.id).toBe(1);
    expect(player.name).toBe('Player1');
    expect(player.socketId).toBe('socket123');
    expect(player.board).toBeInstanceOf(Board);
    expect(player.tickRate).toBe(800);
    expect(player.tickInterval).toBeNull();
    expect(player.alive).toBe(true);
  });

  test('should return the correct payload', () => {
    // Given
    const player = new Player(1, 'Player1', 'socket123');

    // When
    const payload = player.toPayload();

    // Then
    expect(payload).toEqual({
      id: 1,
      name: 'Player1',
      alive: true,
      score: 0,
    });
  });

  test('should update name', () => {
    // Given
    const player = new Player(1, 'Player1', 'socket123');

    // When
    player.updatePlayer('NewName');

    // Then
    expect(player.name).toBe('NewName');
  });

  test('should update score', () => {
    // Given
    const player = new Player(1, 'Player1', 'socket123');

    // When
    player.updateScore(100);

    // Then
    expect(player.score).toBe(100);

    // When
    player.updateScore(50);

    // Then
    expect(player.score).toBe(150);
  });

  test('should have lockPending default to false', () => {
    // When
    const player = new Player(1, 'Player1', 'socket123');

    // Then
    expect(player.lockPending).toBe(false);
  });

  test('forceStop should exist as a method', () => {
    // When
    const player = new Player(1, 'Player1', 'socket123');

    // Then
    expect(typeof player.forceStop).toBe('function');
  });

  test('start does nothing without a socket', () => {
    // Given
    const player = new Player(1, 'Player1', 'socket123');
    const bag = new Tetrominos();

    // When
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    // Then
    expect(player.handleKeys).toBeNull();
  });

  test('start initializes game loop with a socket', () => {
    // Given
    const socket = createMockSocket();
    const player = new Player(1, 'Player1', 'socket1', socket as any);
    const bag = new Tetrominos();
    const notify = vi.fn();
    const onStop = vi.fn();
    const onLinesCleared = vi.fn();
    const onBoardUpdate = vi.fn();

    // When
    player.start(bag, notify, onStop, onLinesCleared, onBoardUpdate);

    // Then
    expect(player.alive).toBe(true);
    expect(player.score).toBe(0);
    expect(player.bagIndex).toBe(1);
    expect(player.handleKeys).not.toBeNull();
    expect(player.tickInterval).not.toBeNull();
    expect(socket.on).toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalled();
    expect(notify).toHaveBeenCalled();

    // Cleanup
    player.forceStop();
  });

  test('handleNextPiece sets a piece on the board', () => {
    // Given
    const socket = createMockSocket();
    const player = new Player(1, 'Player1', 'socket1', socket as any);
    player.bag = new Tetrominos();
    player.bagIndex = 0;

    // When
    const result = player.handleNextPiece();

    // Then
    expect(result).toBe(true);
    expect(player.bagIndex).toBe(1);
    expect(player.board.currPiece).not.toBeNull();
    expect(socket.emit).toHaveBeenCalled();
  });

  test('tick moves piece down when no lockPending', () => {
    // Given
    const socket = createMockSocket();
    const player = new Player(1, 'Player1', 'socket1', socket as any);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    socket.emit.mockClear();

    // When
    player.tick();

    // Then
    expect(player.alive).toBe(true);
    expect(socket.emit).toHaveBeenCalled();

    // Cleanup
    player.forceStop();
  });

  test('tick sets lockPending when piece cannot move down', () => {
    // Given
    const socket = createMockSocket();
    const player = new Player(1, 'Player1', 'socket1', socket as any);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    // Move piece to bottom (moveCurrPieceDown clears internally, safe for all shapes)
    while (player.board.moveCurrPieceDown()) {}

    // When
    player.tick();

    // Then
    expect(player.lockPending).toBe(true);

    // Cleanup
    player.forceStop();
  });

  test('tick locks piece when lockPending and still blocked', () => {
    // Given
    const socket = createMockSocket();
    const player = new Player(1, 'Player1', 'socket1', socket as any);
    const bag = new Tetrominos();
    player.start(bag, vi.fn(), vi.fn(), vi.fn(), vi.fn());

    // Move piece to bottom
    while (player.board.moveCurrPieceDown()) {}
    player.lockPending = true;

    // When
    player.tick();

    // Then
    expect(player.lockPending).toBe(false);
    expect(player.alive).toBe(true);

    // Cleanup
    player.forceStop();
  });

  test('stop clears interval and unregisters keys', () => {
    // Given
    const socket = createMockSocket();
    const player = new Player(1, 'Player1', 'socket1', socket as any);
    const bag = new Tetrominos();
    const onStop = vi.fn();
    player.start(bag, vi.fn(), onStop, vi.fn(), vi.fn());

    // When
    player.stop();

    // Then
    expect(player.alive).toBe(false);
    expect(socket.off).toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
  });

  test('stop does nothing without socket', () => {
    // Given
    const player = new Player(1, 'Player1', 'socket123');

    // When + Then
    expect(() => player.stop()).not.toThrow();
  });

  test('forceStop clears interval without calling onStop', () => {
    // Given
    const socket = createMockSocket();
    const player = new Player(1, 'Player1', 'socket1', socket as any);
    const bag = new Tetrominos();
    const onStop = vi.fn();
    player.start(bag, vi.fn(), onStop, vi.fn(), vi.fn());

    // When
    player.forceStop();

    // Then
    expect(player.alive).toBe(false);
    expect(socket.off).toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
  });

  test('forceStop does nothing without socket', () => {
    // Given
    const player = new Player(1, 'Player1', 'socket123');

    // When + Then
    expect(() => player.forceStop()).not.toThrow();
  });

  test('sendBoard emits board and spectrum', () => {
    // Given
    const socket = createMockSocket();
    const player = new Player(1, 'Player1', 'socket1', socket as any);
    const onBoardUpdate = vi.fn();
    player.onBoardUpdate = onBoardUpdate;

    // When
    player.sendBoard();

    // Then
    expect(socket.emit).toHaveBeenCalled();
    expect(onBoardUpdate).toHaveBeenCalledWith(1, expect.any(Array));
  });

  test('sendScore emits score', () => {
    // Given
    const socket = createMockSocket();
    const player = new Player(1, 'Player1', 'socket1', socket as any);
    player.score = 500;

    // When
    player.sendScore();

    // Then
    expect(socket.emit).toHaveBeenCalledWith(Events.UPDATED_SCORE, { score: 500 });
  });
});
