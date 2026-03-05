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
    if (maxPlayers < 1 || maxPlayers > 8) {
      console.warn(`[GameManager] Cannot create "${roomName}": invalid maxPlayers (${maxPlayers})`);
      return undefined;
    }
    if (this.sessions[roomName]) {
      console.warn(`[GameManager] Cannot create "${roomName}": room already exists`);
      return undefined;
    }
    const session = new GameSession(roomName, maxPlayers, admin);
    this.sessions[roomName] = session;
    console.log(`[GameManager] Session "${roomName}" created (max: ${maxPlayers}, admin: ${admin.id})`);

    return roomName;
  }

  endGameSession(roomName: string) {
    console.log(`[GameManager] Session "${roomName}" ended`);
    delete this.sessions[roomName];
  }

  getGameSessions() {
    return Object.values(this.sessions);
  }

  addPlayerToSession(roomName: string, player: Player): boolean {
    if (!this.sessions[roomName]) {
      console.warn(`[GameManager] Cannot add player ${player.id} to "${roomName}": session not found`);
      return false;
    }
    if (this.sessions[roomName].isPlayerInGame(player.id)) {
      console.warn(`[GameManager] Cannot add player ${player.id} to "${roomName}": already in game`);
      return false;
    }
    return this.sessions[roomName].addPlayer(player);
  }

  removePlayerFromSession(roomName: string, playerId: number) {
    if (this.sessions[roomName]) {
      const isAdmin = this.sessions[roomName].admin.id === playerId;
      this.sessions[roomName].removePlayer(playerId);
      console.log(`[GameManager] Removed player ${playerId} from "${roomName}"`);
      if (this.sessions[roomName].players.length === 0) {
        this.endGameSession(roomName);
      } else if (isAdmin) {
        this.sessions[roomName].admin = this.sessions[roomName].players[0];
        console.log(`[GameManager] New admin for "${roomName}": player ${this.sessions[roomName].admin.id}`);
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
    console.log(`[GameManager] Created player ${playerId} for socket ${socket.id}`);

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
    console.log(`[GameManager] Removed player ${playerId} (socket ${socketId})`);
    return playerId;
  }
}
