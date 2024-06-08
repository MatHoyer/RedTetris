import { GameSession } from "../game/GameSession.js";
import { expect, test, describe } from "vitest";

describe("GameSession", () => {
  test("addPlayer", () => {
    // given
    const gameSession = new GameSession(1);
    const player = { id: 1 };
    // when
    gameSession.addPlayer(player);
    // then
    expect(gameSession.players).toHaveLength(1);
  });

  test("removePlayer", () => {
    // given
    const gameSession = new GameSession(1);
    const player = { id: 1 };
    gameSession.addPlayer(player);
    // when
    gameSession.removePlayer(1);
    // then
    expect(gameSession.players).toHaveLength(0);
  });

  test("start", () => {
    // given
    const gameSession = new GameSession(1);
    // when
    gameSession.start();
    // then
    expect(gameSession.gameManager.gameStarted).toBe(true);
  });

  test("end", () => {
    // given
    const gameSession = new GameSession(1);
    // when
    gameSession.end();
    // then
    expect(gameSession.gameManager.gameStarted).toBe(false);
  });

  test("tick", () => {
    // given
    const gameSession = new GameSession(1);
    // when
    gameSession.tick();
    // then
    expect(gameSession.gameManager.tick).toBeCalled();
  });
});
