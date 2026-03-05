import logger from '../logger.js';
import { Player } from './Player.js';
import { Tetrominos } from './Tetrominos.js';

export class GameSession {
  players: Player[];
  tetromino = new Tetrominos();
  active = false;
  private log;

  constructor(
    readonly id: string,
    readonly maxPlayers: number,
    public admin: Player,
  ) {
    this.players = [admin];
    this.log = logger.child({ component: 'Session', sessionId: id });
  }

  setAdmin(player: Player) {
    this.admin = player;
  }

  isAdmin(playerId: number) {
    return this.admin?.id === playerId;
  }

  isFull() {
    return this.players.length >= this.maxPlayers;
  }

  isPlayerInGame(playerId: number) {
    return this.players.some((p) => p.id === playerId);
  }

  addPlayer(player: Player): boolean {
    if (this.active) {
      this.log.warn(`Player ${player.name || player.id} rejected: game is active`);
      return false;
    }
    if (this.isFull()) {
      this.log.warn(
        `Player ${player.name || player.id} rejected: room is full (${this.players.length}/${this.maxPlayers})`,
      );
      return false;
    }
    this.players.push(player);
    this.log.info(
      `Player ${player.name || player.id} joined (${this.players.length}/${this.maxPlayers})`,
    );
    return true;
  }

  removePlayer(playerId: number) {
    const player = this.players.find((p) => p.id === playerId);
    this.log.info(`Player ${player?.name || playerId} removed`);
    this.players = this.players.filter((p) => p.id !== playerId);
    if (!this.players.length) {
      this.end();
    }
  }

  handlePlayerDeath(deadPlayer: Player) {
    const alivePlayers = this.players.filter((p) => p.alive);
    this.log.info(
      `Player ${deadPlayer.name || deadPlayer.id} died (${alivePlayers.length} alive remaining)`,
    );
    deadPlayer.port?.emitGameEnded('loose');

    if (alivePlayers.length === 1 && this.players.length > 1) {
      this.log.info(`Player ${alivePlayers[0].name || alivePlayers[0].id} wins!`);
      alivePlayers[0].port?.emitGameEnded('win');
      this.end();
    } else if (alivePlayers.length === 0) {
      this.end();
    }
  }

  distributePenalty(sender: Player, linesCleared: number) {
    const penaltyCount = linesCleared - 1;
    if (penaltyCount <= 0) return;
    this.log.info(
      `${sender.name || sender.id} cleared ${linesCleared} lines, sending ${penaltyCount} penalty lines`,
    );

    for (const player of this.players) {
      if (player.id !== sender.id && player.alive) {
        player.board.addPenaltyLines(penaltyCount);
        player.sendBoard();
      }
    }
  }

  broadcastSpectrum(senderId: number, spectrum: number[]) {
    for (const player of this.players) {
      if (player.id !== senderId) {
        player.port?.emitSpectrum(senderId, spectrum);
      }
    }
  }

  broadcastGameData(data: { player: { id: number; name: string; alive: boolean; score: number } }) {
    for (const player of this.players) {
      player.port?.emitGameData(data);
    }
  }

  broadcastGameStarted(roomName: string) {
    for (const player of this.players) {
      player.port?.emitGameStarted(roomName);
    }
  }

  start() {
    this.log.info(`Started with ${this.players.length} players`);
    this.active = true;
    for (const p of this.players) {
      p.start(
        this.tetromino,
        (data) => this.broadcastGameData({ player: data }),
        () => this.handlePlayerDeath(p),
        (count) => this.distributePenalty(p, count),
        (playerId, spectrum) => this.broadcastSpectrum(playerId, spectrum),
      );
    }
  }

  restart() {
    this.log.info(`Restarted`);
    this.tetromino = new Tetrominos();
    this.start();
  }

  end() {
    this.log.info(`Ended`);
    this.active = false;
    for (const p of this.players) {
      if (p.alive) p.forceStop();
    }
  }

  toPayload() {
    return {
      id: this.id,
      maxPlayers: this.maxPlayers,
      admin: { id: this.admin?.id, name: this.admin?.name },
      active: this.active,
      players: this.players.map((p) => p.toPayload()),
    };
  }
}
