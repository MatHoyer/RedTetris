import { type TGameMode } from '../../../events/index.js';
import { saveScores } from '../infrastructure/save-score.js';
import logger from '../logger.js';
import { Player } from './Player.js';
import { Tetrominos } from './Tetrominos.js';

const FRAME_MS = 1000 / 60;
const BOARD_EMIT_INTERVAL = 3; // emit every 3 frames (~20fps)

export class GameSession {
  players: Player[];
  tetromino = new Tetrominos();
  active = false;
  private log;
  private loopInterval: ReturnType<typeof setInterval> | null = null;
  private frameCount = 0;

  constructor(
    readonly id: string,
    readonly maxPlayers: number,
    public admin: Player,
    readonly modes: TGameMode[] = [],
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
    this.log.info(`Player ${player.name || player.id} joined (${this.players.length}/${this.maxPlayers})`);
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
    this.log.info(`Player ${deadPlayer.name || deadPlayer.id} died (${alivePlayers.length} alive remaining)`);
    deadPlayer.port?.emitGameEnded('loose');

    let gameEnded = false;
    if (alivePlayers.length === 1 && this.players.length > 1) {
      this.log.info(`Player ${alivePlayers[0].name || alivePlayers[0].id} wins!`);
      alivePlayers[0].port?.emitGameEnded('win');
      this.end();
      gameEnded = true;
    } else if (alivePlayers.length === 0) {
      this.end();
      gameEnded = true;
    }

    if (!gameEnded) {
      this.persistScores();
    }
  }

  private persistScores() {
    const scores: Record<string, number> = {};
    for (const player of this.players) {
      const key = player.name.trim() || `player${player.id}`;
      scores[key] = player.score;
    }
    void saveScores(scores);
  }

  distributePenalty(sender: Player, linesCleared: number) {
    if (linesCleared <= 0) return;
    this.log.info(`${sender.name || sender.id} cleared ${linesCleared} lines, sending ${linesCleared} penalty lines`);

    for (const player of this.players) {
      if (player.id !== sender.id && player.alive) {
        const survived = player.board.addPenaltyLines(linesCleared);
        if (!survived) {
          player.alive = false;
          player.stop();
        } else {
          player.sendBoard();
        }
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

  broadcastGameData(data: { player: { id: number; name: string; alive: boolean; score: number; level: number } }) {
    for (const player of this.players) {
      player.port?.emitGameData(data);
    }
  }

  broadcastGameStarted(roomName: string) {
    for (const player of this.players) {
      player.port?.emitGameStarted(roomName);
    }
  }

  private tick() {
    this.frameCount++;
    const shouldEmitBoard = this.frameCount % BOARD_EMIT_INTERVAL === 0;

    for (const p of this.players) {
      if (p.alive) {
        p.frame();
        if (shouldEmitBoard) {
          p.sendBoard();
        }
      }
    }
  }

  start() {
    this.log.info(`Started with ${this.players.length} players`);
    this.active = true;
    this.frameCount = 0;

    for (const p of this.players) {
      p.start(
        this.tetromino,
        (data) => this.broadcastGameData({ player: data }),
        () => this.handlePlayerDeath(p),
        (count) => this.distributePenalty(p, count),
        (playerId, spectrum) => this.broadcastSpectrum(playerId, spectrum),
        this.modes,
      );
    }

    this.loopInterval = setInterval(() => this.tick(), FRAME_MS);
  }

  restart() {
    this.log.info(`Restarted`);
    this.stopLoop();
    this.tetromino = new Tetrominos();
    this.start();
  }

  private stopLoop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  end() {
    const wasActive = this.active;
    this.log.info(`Ended`);
    this.active = false;
    this.stopLoop();
    for (const p of this.players) {
      if (p.alive) p.forceStop();
    }
    if (wasActive) {
      this.persistScores();
    }
  }

  toPayload() {
    return {
      id: this.id,
      maxPlayers: this.maxPlayers,
      modes: this.modes,
      admin: { id: this.admin?.id, name: this.admin?.name },
      active: this.active,
      players: this.players.map((p) => p.toPayload()),
    };
  }
}
