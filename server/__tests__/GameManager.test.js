import { GameManager } from "../game/GameManager.js";

import { expect, test, describe } from "vitest";

describe("GameManager", () => {
  test("createGameSession", () => {
    // given
    const gameManager = new GameManager();

    // when
    const session = gameManager.createGameSession();

    // then
    expect(session).toBeDefined();
    expect(session).toBe(0);
  });

  test("endGameSession", () => {
    // given
    const gameManager = new GameManager();
    const session = gameManager.createGameSession();

    // when
    gameManager.endGameSession(session);

    // then
    expect(gameManager.sessions[session]).toBeUndefined();
  });

  test("addPlayerToSession", () => {
    // given
    const gameManager = new GameManager();
    const session = gameManager.createGameSession();

    // when
    gameManager.addPlayerToSession(session, { id: 1 });
    gameManager.addPlayerToSession(session, { id: 2 });

    // then
    expect(gameManager.sessions[session].players).toHaveLength(2);
  });

  test("removePlayerFromSession", () => {
    // given
    const gameManager = new GameManager();
    const session = gameManager.createGameSession();

    // when
    gameManager.addPlayerToSession(session, { id: 1 });
    gameManager.addPlayerToSession(session, { id: 2 });
    gameManager.removePlayerFromSession(session, 1);

    // then
    expect(gameManager.sessions[session].players).toHaveLength(1);
  });

  test("getGameSession", () => {
    // given
    const gameManager = new GameManager();
    const session = gameManager.createGameSession();
    // when
    const gameSession = gameManager.getGameSession(session);
    // then
    expect(gameSession).toBeDefined();
  });
});
