import { type TGameMode } from '../../../events/index.js';
import logger from '../logger.js';
import { GameSession } from './GameSession.js';
import { Player } from './Player.js';
import { PlayerPort } from './ports.js';

const log = logger.child({ component: 'GameManager' });

export class GameManager {
  readonly sessions: Record<string, GameSession> = {};
  readonly players: Record<string, Player> = {};
  private playerIdCounter = 0;

  createGameSession(admin: Player, maxPlayers: number, roomName: string, modes: TGameMode[] = []) {
    if (maxPlayers < 1 || maxPlayers > 8) {
      log.warn(`Cannot create "${roomName}": invalid maxPlayers (${maxPlayers})`);
      return undefined;
    }
    if (this.sessions[roomName]) {
      log.warn(`Cannot create "${roomName}": room already exists`);
      return undefined;
    }
    const session = new GameSession(roomName, maxPlayers, admin, modes);
    this.sessions[roomName] = session;
    log.info(`Session "${roomName}" created (max: ${maxPlayers}, modes: [${modes.join(',')}], admin: ${admin.id})`);
    return roomName;
  }

  endGameSession(roomName: string) {
    log.info(`Session "${roomName}" ended`);
    delete this.sessions[roomName];
  }

  getGameSessions() {
    return Object.values(this.sessions);
  }

  addPlayerToSession(roomName: string, player: Player): boolean {
    const session = this.sessions[roomName];
    if (!session) {
      log.warn(`Cannot add player ${player.id} to "${roomName}": session not found`);
      return false;
    }
    if (session.isPlayerInGame(player.id)) {
      log.warn(`Cannot add player ${player.id} to "${roomName}": already in game`);
      return false;
    }
    return session.addPlayer(player);
  }

  removePlayerFromSession(roomName: string, playerId: number) {
    const session = this.sessions[roomName];
    if (!session) return;

    const isAdmin = session.admin.id === playerId;
    session.removePlayer(playerId);
    log.info(`Removed player ${playerId} from "${roomName}"`);

    if (session.players.length === 0) {
      this.endGameSession(roomName);
    } else if (isAdmin) {
      session.admin = session.players[0];
      log.info(`New admin for "${roomName}": player ${session.admin.id}`);
    }
  }

  getGameSession(roomName: string) {
    return this.sessions[roomName];
  }

  createNewPlayer(socketId: string, port?: PlayerPort) {
    if (!socketId) return;

    if (this.players[socketId]) {
      return this.players[socketId].id;
    }

    const playerId = this.playerIdCounter++;
    this.players[socketId] = new Player(playerId, '', socketId, port);
    log.info(`Created player ${playerId} for socket ${socketId}`);
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
    player.forceStop();
    return player.id;
  }

  removePlayer(socketId: string) {
    const playerId = this.removePlayerFromSessions(socketId);
    delete this.players[socketId];
    log.info(`Removed player ${playerId} (socket ${socketId})`);
    return playerId;
  }
}
