import { type TGameMode } from '../../../events/index.js';
import logger from '../logger.js';
import { Game } from './Game.js';
import { Player } from './Player.js';
import { type PlayerPort, type ScorePort } from './ports.js';

const log = logger.child({ component: 'GameManager' });

export class GameManager {
  readonly games: Record<string, Game> = {};
  readonly players: Record<string, Player> = {};
  private playerIdCounter = 0;

  constructor(private readonly scorePort?: ScorePort) {}

  createGame(admin: Player, maxPlayers: number, roomName: string, modes: TGameMode[] = []) {
    if (maxPlayers < 1 || maxPlayers > 8) {
      log.warn(`Cannot create "${roomName}": invalid maxPlayers (${maxPlayers})`);
      return undefined;
    }
    if (this.games[roomName]) {
      log.warn(`Cannot create "${roomName}": room already exists`);
      return undefined;
    }
    const game = new Game({ id: roomName, maxPlayers, admin, modes, scorePort: this.scorePort });
    this.games[roomName] = game;
    log.info(`Game "${roomName}" created (max: ${maxPlayers}, modes: [${modes.join(',')}], admin: ${admin.id})`);
    return roomName;
  }

  endGame(roomName: string) {
    log.info(`Game "${roomName}" ended`);
    delete this.games[roomName];
  }

  getGames() {
    return Object.values(this.games);
  }

  addPlayerToGame(roomName: string, player: Player): boolean {
    const game = this.games[roomName];
    if (!game) {
      log.warn(`Cannot add player ${player.id} to "${roomName}": game not found`);
      return false;
    }
    if (game.isPlayerInGame(player.id)) {
      log.warn(`Cannot add player ${player.id} to "${roomName}": already in game`);
      return false;
    }
    return game.addPlayer(player);
  }

  removePlayerFromGame(roomName: string, playerId: number) {
    const game = this.games[roomName];
    if (!game) return;

    const isAdmin = game.admin.id === playerId;
    game.removePlayer(playerId);
    log.info(`Removed player ${playerId} from "${roomName}"`);

    if (game.players.length === 0) {
      this.endGame(roomName);
    } else if (isAdmin) {
      game.admin = game.players[0];
      log.info(`New admin for "${roomName}": player ${game.admin.id}`);
    }
  }

  getGame(roomName: string) {
    return this.games[roomName];
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

  removePlayerFromGames(socketId: string) {
    const player = this.players[socketId];
    for (const game of Object.values(this.games)) {
      this.removePlayerFromGame(game.id, player.id);
    }
    player.forceStop();
    return player.id;
  }

  removePlayer(socketId: string) {
    const playerId = this.removePlayerFromGames(socketId);
    delete this.players[socketId];
    log.info(`Removed player ${playerId} (socket ${socketId})`);
    return playerId;
  }
}
