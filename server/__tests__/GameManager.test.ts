import { GameManager } from '../src/domain/GameManager.js';
import { expect, test, describe, vi } from 'vitest';
import { Player } from '../src/domain/Player.js';
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

describe('GameManager', () => {
  test('createGameSession', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');

    const roomName = gameManager.createGameSession(player, 4, 'test-room');

    expect(roomName).toBe('test-room');
    expect(gameManager.sessions['test-room']).toBeDefined();
  });

  test('createGameSession rejects duplicate room name', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    const result = gameManager.createGameSession(new Player(2, '', ''), 4, 'test-room');

    expect(result).toBeUndefined();
  });

  test('createGameSession rejects invalid maxPlayers', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');

    expect(gameManager.createGameSession(player, 0, 'room1')).toBeUndefined();
    expect(gameManager.createGameSession(player, 9, 'room2')).toBeUndefined();
  });

  test('endGameSession', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    gameManager.endGameSession('test-room');

    expect(gameManager.sessions['test-room']).toBeUndefined();
  });

  test('addPlayerToSession', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    gameManager.addPlayerToSession('test-room', new Player(2, '', ''));
    gameManager.addPlayerToSession('test-room', new Player(3, '', ''));

    expect(gameManager.sessions['test-room'].players).toHaveLength(3);
  });

  test('addPlayerToSession returns false for active game', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');
    gameManager.sessions['test-room'].active = true;

    const result = gameManager.addPlayerToSession('test-room', new Player(2, '', ''));

    expect(result).toBe(false);
  });

  test('addPlayerToSession returns false for nonexistent room', () => {
    const gameManager = new GameManager();

    const result = gameManager.addPlayerToSession('nonexistent', new Player(1, '', ''));

    expect(result).toBe(false);
  });

  test('addPlayerToSession returns false if player already in game', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    const result = gameManager.addPlayerToSession('test-room', player);

    expect(result).toBe(false);
  });

  test('removePlayerFromSession', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');
    gameManager.addPlayerToSession('test-room', new Player(2, '', ''));
    gameManager.addPlayerToSession('test-room', new Player(3, '', ''));

    gameManager.removePlayerFromSession('test-room', 2);

    expect(gameManager.sessions['test-room'].players).toHaveLength(2);
  });

  test('removePlayerFromSession deletes session when empty', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    gameManager.removePlayerFromSession('test-room', 1);

    expect(gameManager.sessions['test-room']).toBeUndefined();
  });

  test('removePlayerFromSession promotes next player when admin leaves', () => {
    const gameManager = new GameManager();
    const admin = new Player(1, 'Admin', '');
    const player2 = new Player(2, 'Player2', '');
    gameManager.createGameSession(admin, 4, 'test-room');
    gameManager.addPlayerToSession('test-room', player2);

    gameManager.removePlayerFromSession('test-room', 1);

    expect(gameManager.sessions['test-room'].admin.id).toBe(2);
    expect(gameManager.sessions['test-room'].players).toHaveLength(1);
  });

  test('getGameSession', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    const gameSession = gameManager.getGameSession('test-room');

    expect(gameSession).toBeDefined();
  });

  test('getGameSessions returns all sessions', () => {
    const gameManager = new GameManager();
    gameManager.createGameSession(new Player(1, '', ''), 4, 'room1');
    gameManager.createGameSession(new Player(2, '', ''), 4, 'room2');

    const sessions = gameManager.getGameSessions();

    expect(sessions).toHaveLength(2);
  });

  test('createNewPlayer creates a player from socketId and port', () => {
    const gameManager = new GameManager();
    const port = createMockPort();

    const playerId = gameManager.createNewPlayer('socket-abc', port);

    expect(playerId).toBe(0);
    expect(gameManager.players['socket-abc']).toBeDefined();
    expect(gameManager.players['socket-abc'].socketId).toBe('socket-abc');
  });

  test('createNewPlayer returns existing player id for same socketId', () => {
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);

    const playerId = gameManager.createNewPlayer('socket-abc', port);

    expect(playerId).toBe(0);
  });

  test('getPlayer returns player by socketId', () => {
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);

    const player = gameManager.getPlayer('socket-abc');

    expect(player).toBeDefined();
    expect(player.socketId).toBe('socket-abc');
  });

  test('removePlayer removes from sessions and players map', () => {
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);
    const player = gameManager.getPlayer('socket-abc');
    gameManager.createGameSession(player, 4, 'test-room');

    const removedId = gameManager.removePlayer('socket-abc');

    expect(removedId).toBe(0);
    expect(gameManager.players['socket-abc']).toBeUndefined();
    expect(gameManager.sessions['test-room']).toBeUndefined();
  });

  test('removePlayerFromSessions removes player from all sessions', () => {
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);
    const player = gameManager.getPlayer('socket-abc');
    const otherPlayer = new Player(99, 'Other', '');
    gameManager.createGameSession(otherPlayer, 4, 'room1');
    gameManager.addPlayerToSession('room1', player);

    const removedId = gameManager.removePlayerFromSessions('socket-abc');

    expect(removedId).toBe(0);
    expect(gameManager.sessions['room1'].players).toHaveLength(1);
  });
});
