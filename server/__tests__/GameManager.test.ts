import { GameManager } from '../src/domain/GameManager.js';
import { expect, test, describe, vi } from 'vitest';
import { Player } from '../src/domain/Player.js';
import { type PlayerPort } from '../src/domain/ports';

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

describe('GameManager', () => {
  test('createGame', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');

    const roomName = gameManager.createGame(player, 4, 'test-room');

    expect(roomName).toBe('test-room');
    expect(gameManager.games['test-room']).toBeDefined();
  });

  test('createGame rejects duplicate room name', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGame(player, 4, 'test-room');

    const result = gameManager.createGame(new Player(2, '', ''), 4, 'test-room');

    expect(result).toBeUndefined();
  });

  test('createGame rejects invalid maxPlayers', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');

    expect(gameManager.createGame(player, 0, 'room1')).toBeUndefined();
    expect(gameManager.createGame(player, 9, 'room2')).toBeUndefined();
  });

  test('endGame', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGame(player, 4, 'test-room');

    gameManager.endGame('test-room');

    expect(gameManager.games['test-room']).toBeUndefined();
  });

  test('addPlayerToGame', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGame(player, 4, 'test-room');

    gameManager.addPlayerToGame('test-room', new Player(2, '', ''));
    gameManager.addPlayerToGame('test-room', new Player(3, '', ''));

    expect(gameManager.games['test-room'].players).toHaveLength(3);
  });

  test('addPlayerToGame returns false for active game', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGame(player, 4, 'test-room');
    gameManager.games['test-room'].active = true;

    const result = gameManager.addPlayerToGame('test-room', new Player(2, '', ''));

    expect(result).toBe(false);
  });

  test('addPlayerToGame returns false for nonexistent room', () => {
    const gameManager = new GameManager();

    const result = gameManager.addPlayerToGame('nonexistent', new Player(1, '', ''));

    expect(result).toBe(false);
  });

  test('addPlayerToGame returns false if player already in game', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGame(player, 4, 'test-room');

    const result = gameManager.addPlayerToGame('test-room', player);

    expect(result).toBe(false);
  });

  test('removePlayerFromGame', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGame(player, 4, 'test-room');
    gameManager.addPlayerToGame('test-room', new Player(2, '', ''));
    gameManager.addPlayerToGame('test-room', new Player(3, '', ''));

    gameManager.removePlayerFromGame('test-room', 2);

    expect(gameManager.games['test-room'].players).toHaveLength(2);
  });

  test('removePlayerFromGame deletes game when empty', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGame(player, 4, 'test-room');

    gameManager.removePlayerFromGame('test-room', 1);

    expect(gameManager.games['test-room']).toBeUndefined();
  });

  test('removePlayerFromGame promotes next player when admin leaves', () => {
    const gameManager = new GameManager();
    const admin = new Player(1, 'Admin', '');
    const player2 = new Player(2, 'Player2', '');
    gameManager.createGame(admin, 4, 'test-room');
    gameManager.addPlayerToGame('test-room', player2);

    gameManager.removePlayerFromGame('test-room', 1);

    expect(gameManager.games['test-room'].admin.id).toBe(2);
    expect(gameManager.games['test-room'].players).toHaveLength(1);
  });

  test('getGame', () => {
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    gameManager.createGame(player, 4, 'test-room');

    const game = gameManager.getGame('test-room');

    expect(game).toBeDefined();
  });

  test('getGames returns all games', () => {
    const gameManager = new GameManager();
    gameManager.createGame(new Player(1, '', ''), 4, 'room1');
    gameManager.createGame(new Player(2, '', ''), 4, 'room2');

    const games = gameManager.getGames();

    expect(games).toHaveLength(2);
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

  test('removePlayer removes from games and players map', () => {
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);
    const player = gameManager.getPlayer('socket-abc');
    gameManager.createGame(player, 4, 'test-room');

    const removedId = gameManager.removePlayer('socket-abc');

    expect(removedId).toBe(0);
    expect(gameManager.players['socket-abc']).toBeUndefined();
    expect(gameManager.games['test-room']).toBeUndefined();
  });

  test('removePlayerFromGames removes player from all games', () => {
    const gameManager = new GameManager();
    const port = createMockPort();
    gameManager.createNewPlayer('socket-abc', port);
    const player = gameManager.getPlayer('socket-abc');
    const otherPlayer = new Player(99, 'Other', '');
    gameManager.createGame(otherPlayer, 4, 'room1');
    gameManager.addPlayerToGame('room1', player);

    const removedId = gameManager.removePlayerFromGames('socket-abc');

    expect(removedId).toBe(0);
    expect(gameManager.games['room1'].players).toHaveLength(1);
  });
});
