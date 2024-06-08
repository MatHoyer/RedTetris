import { Tetrominos } from "./Tetrominos.js";

export class GameSession {
  constructor(id, admin) {
    this.id = id;
    this.admin = admin;
    this.players = [];
    this.tetromino = new Tetrominos();
    this.active = false;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(playerId) {
    this.players = this.players.filter((p) => p.id !== playerId);
  }

  start() {
    this.active = true;
    this.players.forEach((p) => p.start());
  }

  end() {
    throw new Error("Not implemented");
  }

  tick() {
    this.gameManager.tick();
  }
}
