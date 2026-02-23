import { GameSession } from '../src/game/GameSession.js';
import { Player } from '../src/game/Player.js';
import { Events } from '../../events/index.js';
import { expect, test, describe, vi } from 'vitest';

const createMockSocket = () => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
});

describe('GameSession', () => {
  test('addPlayer', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    const player = new Player(2, 'Player1', 'socket2');

    // When
    const result = gameSession.addPlayer(player);

    // Then
    expect(result).toBe(true);
    expect(gameSession.players).toHaveLength(2);
  });

  test('addPlayer rejects when game is active', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.active = true;
    const player = new Player(2, 'Player1', 'socket2');

    // When
    const result = gameSession.addPlayer(player);

    // Then
    expect(result).toBe(false);
    expect(gameSession.players).toHaveLength(1);
  });

  test('addPlayer rejects when full', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 2, admin);
    gameSession.addPlayer(new Player(2, 'Player1', 'socket2'));

    // When
    const result = gameSession.addPlayer(new Player(3, 'Player2', 'socket3'));

    // Then
    expect(result).toBe(false);
    expect(gameSession.players).toHaveLength(2);
  });

  test('removePlayer', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    const player = new Player(2, 'Player1', 'socket2');
    gameSession.addPlayer(player);

    // When
    gameSession.removePlayer(2);

    // Then
    expect(gameSession.players).toHaveLength(1);
  });

  test('removePlayer ends game when last player leaves', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.active = true;

    // When
    gameSession.removePlayer(1);

    // Then
    expect(gameSession.players).toHaveLength(0);
    expect(gameSession.active).toBe(false);
  });

  test('start sets active to true', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    // When
    gameSession.start();

    // Then
    expect(gameSession.active).toBe(true);
  });

  test('end sets active to false', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    // When
    gameSession.end();

    // Then
    expect(gameSession.active).toBe(false);
  });

  test('isAdmin', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    // When
    const adminResult = gameSession.isAdmin(1);
    const nonAdminResult = gameSession.isAdmin(2);

    // Then
    expect(adminResult).toBe(true);
    expect(nonAdminResult).toBe(false);
  });

  test('isFull', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 1, admin);

    // When
    const result = gameSession.isFull();

    // Then
    expect(result).toBe(true);
  });

  test('restart resets tetromino bag and starts game', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.active = false;
    const oldBag = gameSession.tetromino;

    // When
    gameSession.restart();

    // Then
    expect(gameSession.active).toBe(true);
    expect(gameSession.tetromino).not.toBe(oldBag);
  });

  test('toPayload', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    // When
    const payload = gameSession.toPayload();

    // Then
    expect(payload.id).toBe('room1');
    expect(payload.admin).toBe('Admin');
    expect(payload.maxPlayers).toBe(4);
    expect(payload.active).toBe(false);
    expect(payload.players).toHaveLength(1);
  });

  test('setAdmin changes the admin', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);
    const newAdmin = new Player(2, 'NewAdmin', 'socket2');
    gameSession.addPlayer(newAdmin);

    // When
    gameSession.setAdmin(newAdmin);

    // Then
    expect(gameSession.isAdmin(2)).toBe(true);
    expect(gameSession.isAdmin(1)).toBe(false);
  });

  test('isPlayerInGame', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession('room1', 4, admin);

    // When + Then
    expect(gameSession.isPlayerInGame(1)).toBe(true);
    expect(gameSession.isPlayerInGame(99)).toBe(false);
  });

  test('handlePlayerDeath emits loose to dead player in multiplayer', () => {
    // Given
    const socket1 = createMockSocket();
    const socket2 = createMockSocket();
    const admin = new Player(1, 'Admin', 'socket1', socket1 as any);
    const player2 = new Player(2, 'Player2', 'socket2', socket2 as any);
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);
    admin.alive = false;
    player2.alive = true;

    // When
    gameSession.handlePlayerDeath(admin);

    // Then
    expect(socket1.emit).toHaveBeenCalledWith(Events.GAME_ENDED, { status: 'loose' });
    expect(socket2.emit).toHaveBeenCalledWith(Events.GAME_ENDED, { status: 'win' });
    expect(gameSession.active).toBe(false);
  });

  test('handlePlayerDeath ends game when all players dead in solo', () => {
    // Given
    const socket1 = createMockSocket();
    const admin = new Player(1, 'Admin', 'socket1', socket1 as any);
    const gameSession = new GameSession('room1', 1, admin);
    admin.alive = false;

    // When
    gameSession.handlePlayerDeath(admin);

    // Then
    expect(socket1.emit).toHaveBeenCalledWith(Events.GAME_ENDED, { status: 'loose' });
    expect(gameSession.active).toBe(false);
  });

  test('distributePenalty sends penalty lines to other alive players', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const socket2 = createMockSocket();
    const player2 = new Player(2, 'Player2', 'socket2', socket2 as any);
    player2.onBoardUpdate = vi.fn();
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);
    player2.alive = true;

    // When
    gameSession.distributePenalty(admin, 3);

    // Then
    expect(player2.board.grid[19].every((c) => c === 'penalty')).toBe(true);
    expect(player2.board.grid[18].every((c) => c === 'penalty')).toBe(true);
  });

  test('distributePenalty does nothing for 1 or fewer lines', () => {
    // Given
    const admin = new Player(1, 'Admin', 'socket1');
    const player2 = new Player(2, 'Player2', 'socket2');
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);

    // When
    gameSession.distributePenalty(admin, 1);

    // Then
    expect(player2.board.grid[19].every((c) => c === 'empty')).toBe(true);
  });

  test('broadcastSpectrum sends spectrum to other players', () => {
    // Given
    const socket1 = createMockSocket();
    const socket2 = createMockSocket();
    const admin = new Player(1, 'Admin', 'socket1', socket1 as any);
    const player2 = new Player(2, 'Player2', 'socket2', socket2 as any);
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);
    const spectrum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // When
    gameSession.broadcastSpectrum(1, spectrum);

    // Then
    expect(socket2.emit).toHaveBeenCalledWith(Events.UPDATED_SPECTRUM, { playerId: 1, spectrum });
    expect(socket1.emit).not.toHaveBeenCalled();
  });

  test('broadcast sends event to all players', () => {
    // Given
    const socket1 = createMockSocket();
    const socket2 = createMockSocket();
    const admin = new Player(1, 'Admin', 'socket1', socket1 as any);
    const player2 = new Player(2, 'Player2', 'socket2', socket2 as any);
    const gameSession = new GameSession('room1', 4, admin);
    gameSession.addPlayer(player2);

    // When
    gameSession.broadcast('TEST_EVENT', { data: 'test' });

    // Then
    expect(socket1.emit).toHaveBeenCalledWith('TEST_EVENT', { data: 'test' });
    expect(socket2.emit).toHaveBeenCalledWith('TEST_EVENT', { data: 'test' });
  });
});
