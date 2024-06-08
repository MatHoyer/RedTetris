import { GameSession } from "./GameSession.js";

export class GameManager {
  constructor() {
    this.sessions = {};
    this.sessionIdCounter = 0;
  }

  createGameSession() {
    const sessionId = this.sessionIdCounter++;
    const session = new GameSession();
    this.sessions[sessionId] = session;
    
    return sessionId;
  }

  endGameSession(sessionId) {
    delete this.sessions[sessionId];
  }

  addPlayerToSession(sessionId, player) {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].addPlayer(player);
    }
  }

  removePlayerFromSession(sessionId, playerId) {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].removePlayer(playerId);
    }
  }

  getGameSession(sessionId) {
    return this.sessions[sessionId];
  }
}
