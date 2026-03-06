import { GameSession } from '../src/domain/GameSession.js';
import { Player, PlayerState } from '../src/domain/Player.js';
import { PlayerPort } from '../src/domain/ports';
import { expect, test, describe, vi, afterEach } from 'vitest';

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

describe('GameSession', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('addPlayer', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    const player = new Player(2, 'Player1', 'socket2');

    const result = gameSession.addPlayer(player);

    expect(result).toBe(true);
    expect(gameSession.players).toHaveLength(2);
  });

  test('addPlayer rejects when game is active', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.active = true;
    const player = new Player(2, 'Player1', 'socket2');

    const result = gameSession.addPlayer(player);

    expect(result).toBe(false);
    expect(gameSession.players).toHaveLength(1);
  });

  test('addPlayer rejects when full', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 2, admin);
    gameSession.addPlayer(new Player(2, 'Player1', 'socket2'));

    const result = gameSession.addPlayer(new Player(3, 'Player2', 'socket3'));

    expect(result).toBe(false);
    expect(gameSession.players).toHaveLength(2);
  });

  test('removePlayer', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    const player = new Player(2, 'Player1', 'socket2');
    gameSession.addPlayer(player);

    gameSession.removePlayer(2);

    expect(gameSession.players).toHaveLength(1);
  });

  test('removePlayer ends game when last player leaves', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.active = true;

    gameSession.removePlayer(1);

    expect(gameSession.players).toHaveLength(0);
    expect(gameSession.active).toBe(false);
  });

  test('start sets active and creates shared game loop', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    gameSession.start();

    expect(gameSession.active).toBe(true);

    gameSession.end();
  });

  test('end sets active to false and clears game loop', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    gameSession.end();

    expect(gameSession.active).toBe(false);
  });

  test('start with port players initializes all players', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);

    gameSession.start();

    expect(admin.state).toBe(PlayerState.ACTIVE);
    expect(player2.state).toBe(PlayerState.ACTIVE);
    expect(admin.alive).toBe(true);
    expect(player2.alive).toBe(true);

    gameSession.end();
  });

  test('isAdmin', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    expect(gameSession.isAdmin(1)).toBe(true);
    expect(gameSession.isAdmin(2)).toBe(false);
  });

  test('isFull', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 1, admin);

    expect(gameSession.isFull()).toBe(true);
  });

  test('restart resets tetromino bag and starts game', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.active = false;
    const oldBag = gameSession.tetromino;

    gameSession.restart();

    expect(gameSession.active).toBe(true);
    expect(gameSession.tetromino).not.toBe(oldBag);

    gameSession.end();
  });

  test('toPayload', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    const payload = gameSession.toPayload();

    expect(payload.id).toBe('room1');
    expect(payload.admin).toEqual({ id: 1, name: 'Admin' });
    expect(payload.maxPlayers).toBe(4);
    expect(payload.active).toBe(false);
    expect(payload.players).toHaveLength(1);
  });

  test('setAdmin changes the admin', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    const newAdmin = new Player(2, 'NewAdmin', 'socket2');
    gameSession.addPlayer(newAdmin);

    gameSession.setAdmin(newAdmin);

    expect(gameSession.isAdmin(2)).toBe(true);
    expect(gameSession.isAdmin(1)).toBe(false);
  });

  test('isPlayerInGame', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    expect(gameSession.isPlayerInGame(1)).toBe(true);
    expect(gameSession.isPlayerInGame(99)).toBe(false);
  });

  test('handlePlayerDeath emits loose to dead player in multiplayer', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);
    admin.alive = false;
    player2.alive = true;

    gameSession.handlePlayerDeath(admin);

    expect(port1.emitGameEnded).toHaveBeenCalledWith('loose');
    expect(port2.emitGameEnded).toHaveBeenCalledWith('win');
    expect(gameSession.active).toBe(false);
  });

  test('handlePlayerDeath ends game when all players dead in solo', () => {
    const port1 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const gameSession = new GameSession('room1', 1, admin);
    admin.alive = false;

    gameSession.handlePlayerDeath(admin);

    expect(port1.emitGameEnded).toHaveBeenCalledWith('loose');
    expect(gameSession.active).toBe(false);
  });

  test('distributePenalty sends penalty lines to other alive players', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const port2 = createMockPort();
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    player2.onBoardUpdate = vi.fn();
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);
    player2.alive = true;

    gameSession.distributePenalty(admin, 3);

    expect(player2.board.grid[20].every((c) => c === 'penalty')).toBe(true);
    expect(player2.board.grid[19].every((c) => c === 'penalty')).toBe(true);
  });

  test('distributePenalty does nothing for 1 or fewer lines', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const player2 = new Player(2, 'Player2', 'socket2');
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);

    gameSession.distributePenalty(admin, 1);

    expect(player2.board.grid[20].every((c) => c === 'empty')).toBe(true);
  });

  test('broadcastSpectrum sends spectrum to other players', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);
    const spectrum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    gameSession.broadcastSpectrum(1, spectrum);

    expect(port2.emitSpectrum).toHaveBeenCalledWith(1, spectrum);
    expect(port1.emitSpectrum).not.toHaveBeenCalled();
  });

  test('broadcastGameData sends data to all players', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);
    const data = { player: { id: 1, name: 'Admin', alive: true, score: 0 } };

    gameSession.broadcastGameData(data);

    expect(port1.emitGameData).toHaveBeenCalledWith(data);
    expect(port2.emitGameData).toHaveBeenCalledWith(data);
  });
});
