import { afterEach, describe, expect, test, vi } from 'vitest';
import { Game } from '../src/domain/Game.js';
import { Player, PlayerState } from '../src/domain/Player.js';
import { type PlayerPort, type ScorePort } from '../src/domain/ports';

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

const createScorePort = (): ScorePort => ({
  saveScores: vi.fn().mockResolvedValue(undefined),
});

const createGame = (admin: Player, maxPlayers = 4, modes = [], scorePort?: ScorePort) =>
  new Game({ id: 'room1', maxPlayers, admin, modes, scorePort });

describe('Game', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('addPlayer', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);
    const player = new Player(2, 'Player1', 'socket2');

    const result = game.addPlayer(player);

    expect(result).toBe(true);
    expect(game.players).toHaveLength(2);
  });

  test('addPlayer rejects when game is active', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);
    game.active = true;
    const player = new Player(2, 'Player1', 'socket2');

    const result = game.addPlayer(player);

    expect(result).toBe(false);
    expect(game.players).toHaveLength(1);
  });

  test('addPlayer rejects when full', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin, 2);
    game.addPlayer(new Player(2, 'Player1', 'socket2'));

    const result = game.addPlayer(new Player(3, 'Player2', 'socket3'));

    expect(result).toBe(false);
    expect(game.players).toHaveLength(2);
  });

  test('removePlayer', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);
    const player = new Player(2, 'Player1', 'socket2');
    game.addPlayer(player);

    game.removePlayer(2);

    expect(game.players).toHaveLength(1);
  });

  test('removePlayer ends game when last player leaves', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);
    game.active = true;

    game.removePlayer(1);

    expect(game.players).toHaveLength(0);
    expect(game.active).toBe(false);
  });

  test('removePlayer during active game declares remaining player as winner', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const game = createGame(admin);
    game.addPlayer(player2);
    game.active = true;
    admin.alive = true;
    player2.alive = true;

    game.removePlayer(1);

    expect(port2.emitGameEnded).toHaveBeenCalledWith('win');
    expect(game.active).toBe(false);
  });

  test('removePlayer during active game does not declare winner when multiple players remain', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const port3 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const player3 = new Player(3, 'Player3', 'socket3', port3);
    const game = createGame(admin);
    game.addPlayer(player2);
    game.addPlayer(player3);
    game.active = true;
    admin.alive = true;
    player2.alive = true;
    player3.alive = true;

    game.removePlayer(1);

    expect(port2.emitGameEnded).not.toHaveBeenCalled();
    expect(port3.emitGameEnded).not.toHaveBeenCalled();
    expect(game.active).toBe(true);
  });

  test('start sets active and creates shared game loop', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);

    game.start();

    expect(game.active).toBe(true);

    game.end();
  });

  test('end sets active to false and clears game loop', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);

    game.end();

    expect(game.active).toBe(false);
  });

  test('end persists scores through injected score port when game was active', () => {
    const scorePort = createScorePort();
    const admin = new Player(1, 'Admin', 'socket1');
    const player2 = new Player(2, '  ', 'socket2');
    admin.score = 42;
    player2.score = 7;
    const game = createGame(admin, 4, ['fast'], scorePort);
    game.addPlayer(player2);
    game.active = true;

    game.end();

    expect(scorePort.saveScores).toHaveBeenCalledWith({ Admin: 42, player2: 7 }, ['fast']);
  });

  test('start with port players initializes all players', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const game = createGame(admin);
    game.addPlayer(player2);

    game.start();

    expect(admin.state).toBe(PlayerState.ACTIVE);
    expect(player2.state).toBe(PlayerState.ACTIVE);
    expect(admin.alive).toBe(true);
    expect(player2.alive).toBe(true);

    game.end();
  });

  test('isAdmin', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);

    expect(game.isAdmin(1)).toBe(true);
    expect(game.isAdmin(2)).toBe(false);
  });

  test('isFull', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin, 1);

    expect(game.isFull()).toBe(true);
  });

  test('restart resets tetromino bag and starts game', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);
    game.active = false;
    const oldBag = game.tetromino;

    game.restart();

    expect(game.active).toBe(true);
    expect(game.tetromino).not.toBe(oldBag);

    game.end();
  });

  test('toPayload', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);

    const payload = game.toPayload();

    expect(payload.id).toBe('room1');
    expect(payload.admin).toEqual({ id: 1, name: 'Admin' });
    expect(payload.maxPlayers).toBe(4);
    expect(payload.active).toBe(false);
    expect(payload.players).toHaveLength(1);
  });

  test('setAdmin changes the admin', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);
    const newAdmin = new Player(2, 'NewAdmin', 'socket2');
    game.addPlayer(newAdmin);

    game.setAdmin(newAdmin);

    expect(game.isAdmin(2)).toBe(true);
    expect(game.isAdmin(1)).toBe(false);
  });

  test('isPlayerInGame', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const game = createGame(admin);

    expect(game.isPlayerInGame(1)).toBe(true);
    expect(game.isPlayerInGame(99)).toBe(false);
  });

  test('handlePlayerDeath emits loose to dead player in multiplayer', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const game = createGame(admin);
    game.addPlayer(player2);
    admin.alive = false;
    player2.alive = true;

    game.handlePlayerDeath(admin);

    expect(port1.emitGameEnded).toHaveBeenCalledWith('loose');
    expect(port2.emitGameEnded).toHaveBeenCalledWith('win');
    expect(game.active).toBe(false);
  });

  test('handlePlayerDeath ends game when all players dead in solo', () => {
    const port1 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const game = createGame(admin, 1);
    admin.alive = false;

    game.handlePlayerDeath(admin);

    expect(port1.emitGameEnded).toHaveBeenCalledWith('loose');
    expect(game.active).toBe(false);
  });

  test('distributePenalty sends penalty lines to other alive players', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const port2 = createMockPort();
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    player2.onBoardUpdate = vi.fn();
    const game = createGame(admin);
    game.addPlayer(player2);
    player2.alive = true;

    game.distributePenalty(admin, 3);

    expect(player2.board.grid[20].every((c) => c === 'penalty')).toBe(true);
    expect(player2.board.grid[19].every((c) => c === 'penalty')).toBe(true);
    expect(player2.board.grid[18].every((c) => c === 'penalty')).toBe(true);
  });

  test('distributePenalty sends 1 penalty line for 1 line cleared', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const port2 = createMockPort();
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    player2.onBoardUpdate = vi.fn();
    const game = createGame(admin);
    game.addPlayer(player2);
    player2.alive = true;

    game.distributePenalty(admin, 1);

    expect(player2.board.grid[20].every((c) => c === 'penalty')).toBe(true);
    expect(player2.board.grid[19].every((c) => c === 'empty')).toBe(true);
  });

  test('distributePenalty does nothing for 0 or fewer lines', () => {
    const admin = new Player(1, 'Admin', 'socket1');
    const player2 = new Player(2, 'Player2', 'socket2');
    const game = createGame(admin);
    game.addPlayer(player2);

    game.distributePenalty(admin, 0);

    expect(player2.board.grid[20].every((c) => c === 'empty')).toBe(true);
  });

  test('broadcastSpectrum sends spectrum to other players', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const game = createGame(admin);
    game.addPlayer(player2);
    const spectrum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    game.broadcastSpectrum(1, spectrum);

    expect(port2.emitSpectrum).toHaveBeenCalledWith(1, spectrum);
    expect(port1.emitSpectrum).not.toHaveBeenCalled();
  });

  test('broadcastGameData sends data to all players', () => {
    const port1 = createMockPort();
    const port2 = createMockPort();
    const admin = new Player(1, 'Admin', 'socket1', port1);
    const player2 = new Player(2, 'Player2', 'socket2', port2);
    const game = createGame(admin);
    game.addPlayer(player2);
    const data = { player: { id: 1, name: 'Admin', alive: true, score: 0 } };

    game.broadcastGameData(data);

    expect(port1.emitGameData).toHaveBeenCalledWith(data);
    expect(port2.emitGameData).toHaveBeenCalledWith(data);
  });
});
