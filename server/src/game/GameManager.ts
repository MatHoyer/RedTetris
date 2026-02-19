import { Socket } from 'socket.io';
import { GameSession } from './GameSession.js';
import { Player } from './Player.js';

export class GameManager {
  sessions: Record<string, GameSession>;
  players: Record<string, Player>;
  playerIdCounter: number;

  constructor() {
    this.sessions = {};
    this.players = {};
    this.playerIdCounter = 0;
  }

  createGameSession(admin: Player, maxPlayers: number, roomName: string) {
    if (maxPlayers < 1 || maxPlayers > 8) return undefined;
    if (this.sessions[roomName]) return undefined;
    const session = new GameSession(roomName, maxPlayers, admin);
    this.sessions[roomName] = session;

    return roomName;
  }

  endGameSession(roomName: string) {
    delete this.sessions[roomName];
  }

  getGameSessions() {
    return Object.values(this.sessions);
  }

  addPlayerToSession(roomName: string, player: Player): boolean {
    if (!this.sessions[roomName]) return false;
    if (this.sessions[roomName].isPlayerInGame(player.id)) return false;
    return this.sessions[roomName].addPlayer(player);
  }

  removePlayerFromSession(roomName: string, playerId: number) {
    if (this.sessions[roomName]) {
      const isAdmin = this.sessions[roomName].admin.id === playerId;
      this.sessions[roomName].removePlayer(playerId);
      if (this.sessions[roomName].players.length === 0) {
        this.endGameSession(roomName);
      } else if (isAdmin) {
        this.sessions[roomName].admin = this.sessions[roomName].players[0];
      }
    }
  }

  getGameSession(roomName: string) {
    return this.sessions[roomName];
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
    player.stop();
    return player.id;
  }

  removePlayer(socketId: string) {
    const playerId = this.removePlayerFromSessions(socketId);
    delete this.players[socketId];
    return playerId;
  }
}
