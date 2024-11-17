import { GameSession } from '../src/game/GameSession.js';
import { Player } from '../src/game/Player.js';
import { expect, test, describe } from 'vitest';

describe('GameSession', () => {
  test('addPlayer', () => {
    // given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession(1, 4, admin);
    const player = new Player(2, 'Player1', 'socket2');
    // when
    gameSession.addPlayer(player);
    // then
    expect(gameSession.players).toHaveLength(2);
  });

  test('removePlayer', () => {
    // given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession(1, 4, admin);
    const player = new Player(2, 'Player1', 'socket2');
    gameSession.addPlayer(player);
    // when
    gameSession.removePlayer(2);
    // then
    expect(gameSession.players).toHaveLength(1);
  });

  test('start', () => {
    // given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession(1, 4, admin);
    // when
    gameSession.start();
    // then
    expect(gameSession.active).toBe(true);
  });

  test('end', () => {
    // given
    const admin = new Player(1, 'Admin', 'socket1');
    const gameSession = new GameSession(1, 4, admin);
    // when
    gameSession.end();
    // then
    expect(gameSession.active).toBe(false);
  });
});
