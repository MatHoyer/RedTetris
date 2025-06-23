import { GameSession } from './GameSession.js';
import { Player } from './Player.js';

export class GameManager {
  sessions: Record<number, GameSession>;
  sessionIdCounter: number;
  players: Record<string, Player>;
  playerIdCounter: number;

  constructor() {
    this.sessions = {
      1: new GameSession(1, 5, new Player(0, 'server', null)),
    };
    this.sessionIdCounter = 0;
    this.players = {};
    this.playerIdCounter = 0;
  }

  createGameSession(admin: Player, maxPlayers: number) {
    if (maxPlayers < 1 || maxPlayers > 8) return;
    const sessionId = this.sessionIdCounter++;
    const session = new GameSession(sessionId, maxPlayers, admin);
    this.sessions[sessionId] = session;

    return sessionId;
  }

  endGameSession(sessionId: number) {
    delete this.sessions[sessionId];
  }

  getGameSessions() {
    return Object.values(this.sessions);
  }

  addPlayerToSession(sessionId: number, player: Player) {
    if (!this.sessions[sessionId]) return;
    this.sessions[sessionId].addPlayer(player);
  }

  removePlayerFromSession(sessionId: number, playerId: number) {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].removePlayer(playerId);
    }
  }

  getGameSession(sessionId: number) {
    return this.sessions[sessionId];
  }

  createNewPlayer(socketId: string) {
    if (!socketId) return;

    if (this.players[socketId]) {
      return this.players[socketId].id;
    }

    const playerId = this.playerIdCounter++;
    const player = new Player(playerId, '', socketId);
    this.players[socketId] = player;

    return playerId;
  }

  getPlayer(socketId: string) {
    return this.players[socketId];
  }

  removePlayer(socketId: string) {
    const player = this.players[socketId];
    for (const session of Object.values(this.sessions)) {
      session.removePlayer(player.id);
    }
    delete this.players[socketId];
    return player.id;
  }
}
