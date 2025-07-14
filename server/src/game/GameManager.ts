import { Socket } from 'socket.io';
import { GameSession } from './GameSession.js';
import { Player } from './Player.js';

export class GameManager {
  sessions: Record<number, GameSession>;
  sessionIdCounter: number;
  players: Record<string, Player>;
  playerIdCounter: number;

  constructor() {
    this.sessions = {
      1000: new GameSession(1000, 5, new Player(-1, 'server', null)),
    };
    this.sessionIdCounter = 0;
    this.players = {};
    this.playerIdCounter = 0;
  }

  createGameSession(admin: Player, maxPlayers: number) {
    if (maxPlayers < 1 || maxPlayers > 8) return;
    const sessionId = ++this.sessionIdCounter;
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
    if (this.sessions[sessionId].isPlayerInGame(player.id)) return;
    this.sessions[sessionId].addPlayer(player);
  }

  removePlayerFromSession(sessionId: number, playerId: number) {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].removePlayer(playerId);
      if (this.sessions[sessionId].players.length === 0) {
        this.endGameSession(sessionId);
      }
    }
  }

  getGameSession(sessionId: number) {
    return this.sessions[sessionId];
  }

  createNewPlayer(socket: Socket) {
    if (!socket.id) return;

    if (this.players[socket.id]) {
      return this.players[socket.id].id;
    }

    const playerId = this.playerIdCounter++;
    const player = new Player(playerId, '', socket.id, socket);
    this.players[socket.id] = player;

    return playerId;
  }

  getPlayer(socketId: string) {
    return this.players[socketId];
  }

  removePlayerFromSessions(socketId: string) {
    const player = this.players[socketId];
    for (const session of Object.values(this.sessions)) {
      this.removePlayerFromSession(session.id, player.id);
    }
    return player.id;
  }

  removePlayer(socketId: string) {
    const playerId = this.removePlayerFromSessions(socketId);
    delete this.players[socketId];
    return playerId;
  }
}
