import { GameManager } from '../src/game/GameManager.js';
import { expect, test, describe } from 'vitest';
import { Player } from '../src/game/Player.js';

describe('GameManager', () => {
  test('createGameSession', () => {
    // given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');

    // when
    const session = gameManager.createGameSession(player, 1);

    // then
    expect(session).toBeDefined();
    expect(session).toBe(0);
  });

  test('endGameSession', () => {
    // given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    const session = gameManager.createGameSession(player, 1);

    // when
    gameManager.endGameSession(session!);

    // then
    expect(gameManager.sessions[session!]).toBeUndefined();
  });

  test('addPlayerToSession', () => {
    // given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    const session = gameManager.createGameSession(player, 4);

    // when
    gameManager.addPlayerToSession(session!, new Player(2, '', ''));
    gameManager.addPlayerToSession(session!, new Player(3, '', ''));

    // then
    expect(gameManager.sessions[session!].players).toHaveLength(3);
  });

  test('removePlayerFromSession', () => {
    // given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    const session = gameManager.createGameSession(player, 1);

    // when
    gameManager.addPlayerToSession(session!, new Player(2, '', ''));
    gameManager.addPlayerToSession(session!, new Player(3, '', ''));
    gameManager.removePlayerFromSession(session!, 2);

    // then
    expect(gameManager.sessions[session!].players).toHaveLength(1);
  });

  test('getGameSession', () => {
    // given
    const gameManager = new GameManager();
    const player = new Player(1, '', '');
    const session = gameManager.createGameSession(player, 1);

    // when
    const gameSession = gameManager.getGameSession(session!);

    // then
    expect(gameSession).toBeDefined();
  });
});
