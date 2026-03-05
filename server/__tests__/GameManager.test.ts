import { GameManager } from '../src/domain/GameManager.js';
import { expect, test, describe, vi } from 'vitest';
import { Player } from '../src/domain/Player.js';
import { PlayerPort } from '../src/domain/ports';

const createMockPort = (): PlayerPort => ({
  emitBoard: vi.fn(),
  emitScore: vi.fn(),
  emitNextPiece: vi.fn(),
  emitGameEnded: vi.fn(),
  emitGameStarted: vi.fn(),
  emitGameData: vi.fn(),
  emitSpectrum: vi.fn(),
  onKeyInput: vi.fn(),
  offKeyInput: vi.fn(),
});

describe('GameManager', () => {
  test('createGameSession', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');

    // When
    const roomName = gameManager.createGameSession(player, 4, 'test-room');

    // Then
    expect(roomName).toBe('test-room');
    expect(gameManager.sessions['test-room']).toBeDefined();
  });

  test('createGameSession rejects duplicate room name', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    // When
    const result = gameManager.createGameSession(new Player(2, '', ''), 4, 'test-room');

    // Then
    expect(result).toBeUndefined();
  });

  test('createGameSession rejects invalid maxPlayers', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');

    // When + Then
    expect(gameManager.createGameSession(player, 0, 'room1')).toBeUndefined();
    expect(gameManager.createGameSession(player, 9, 'room2')).toBeUndefined();
  });

  test('endGameSession', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    // When
    gameManager.endGameSession('test-room');

    // Then
    expect(gameManager.sessions['test-room']).toBeUndefined();
  });

  test('addPlayerToSession', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    // When
    gameManager.addPlayerToSession('test-room', new Player(2, '', ''));
    gameManager.addPlayerToSession('test-room', new Player(3, '', ''));

    // Then
    expect(gameManager.sessions['test-room'].players).toHaveLength(3);
  });

  test('addPlayerToSession returns false for active game', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');
    gameManager.sessions['test-room'].active = true;

    // When
    const result = gameManager.addPlayerToSession('test-room', new Player(2, '', ''));

    // Then
    expect(result).toBe(false);
  });

  test('addPlayerToSession returns false for nonexistent room', () => {
    // Given
    const gameManager = new GameManager();

    // When
    const result = gameManager.addPlayerToSession('nonexistent', new Player(1, '', ''));

    // Then
    expect(result).toBe(false);
  });

  test('addPlayerToSession returns false if player already in game', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    // When
    const result = gameManager.addPlayerToSession('test-room', player);

    // Then
    expect(result).toBe(false);
  });

  test('removePlayerFromSession', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');
    gameManager.addPlayerToSession('test-room', new Player(2, '', ''));
    gameManager.addPlayerToSession('test-room', new Player(3, '', ''));

    // When
    gameManager.removePlayerFromSession('test-room', 2);

    // Then
    expect(gameManager.sessions['test-room'].players).toHaveLength(2);
  });

  test('removePlayerFromSession deletes session when empty', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    // When
    gameManager.removePlayerFromSession('test-room', 1);

    // Then
    expect(gameManager.sessions['test-room']).toBeUndefined();
  });

  test('removePlayerFromSession promotes next player when admin leaves', () => {
    // Given
    const gameManager = new GameManager();
    const admin = new Player(1, 'Admin', '');
    const player2 = new Player(2, 'Player2', '');
    gameManager.createGameSession(admin, 4, 'test-room');
    gameManager.addPlayerToSession('test-room', player2);

    // When
    gameManager.removePlayerFromSession('test-room', 1);

    // Then
    expect(gameManager.sessions['test-room'].admin.id).toBe(2);
    expect(gameManager.sessions['test-room'].players).toHaveLength(1);
  });

  test('getGameSession', () => {
    // Given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGameSession(player, 4, 'test-room');

    // When
    const gameSession = gameManager.getGameSession('test-room');

    // Then
    expect(gameSession).toBeDefined();
  });

  test('getGameSessions returns all sessions', () => {
    // Given
    const gameManager = new GameManager();
    gameManager.createGameSession(new Player(1, '', ''), 4, 'room1');
    gameManager.createGameSession(new Player(2, '', ''), 4, 'room2');

    // When
    const sessions = gameManager.getGameSessions();

    // Then
    expect(sessions).toHaveLength(2);
  });

  test('createNewPlayer creates a player from socketId and port', () => {
    // Given
    const gameManager = new GameManager();
    const port = createMockPort();

    // When
    const playerId = gameManager.createNewPlayer('socket-abc', port);

    // Then
    expect(playerId).toBe(0);
    expect(gameManager.players['socket-abc']).toBeDefined();
    expect(gameManager.players['socket-abc'].socketId).toBe('socket-abc');
  });

  test('createNewPlayer returns existing player id for same socketId', () => {
    // Given
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);

    // When
    const playerId = gameManager.createNewPlayer('socket-abc', port);

    // Then
    expect(playerId).toBe(0);
  });

  test('getPlayer returns player by socketId', () => {
    // Given
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);

    // When
    const player = gameManager.getPlayer('socket-abc');

    // Then
    expect(player).toBeDefined();
    expect(player.socketId).toBe('socket-abc');
  });

  test('removePlayer removes from sessions and players map', () => {
    // Given
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);
    const player = gameManager.getPlayer('socket-abc');
    gameManager.createGameSession(player, 4, 'test-room');

    // When
    const removedId = gameManager.removePlayer('socket-abc');

    // Then
    expect(removedId).toBe(0);
    expect(gameManager.players['socket-abc']).toBeUndefined();
    expect(gameManager.sessions['test-room']).toBeUndefined();
  });

  test('removePlayerFromSessions removes player from all sessions', () => {
    // Given
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);
    const player = gameManager.getPlayer('socket-abc');
    const otherPlayer = new Player(99, 'Other', '');
    gameManager.createGameSession(otherPlayer, 4, 'room1');
    gameManager.addPlayerToSession('room1', player);

    // When
    const removedId = gameManager.removePlayerFromSessions('socket-abc');

    // Then
    expect(removedId).toBe(0);
    expect(gameManager.sessions['room1'].players).toHaveLength(1);
  });
});
