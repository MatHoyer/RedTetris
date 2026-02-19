import { Events } from '../../../events/index.js';
import { Player } from './Player.js';
import { Tetrominos } from './Tetrominos.js';

export class GameSession {
  id: string;
  admin: Player;
  maxPlayers: number;
  players: Player[];
  tetromino: Tetrominos;
  active: boolean;

  constructor(id: string, maxPlayers: number, admin: Player) {
    this.id = id;
    this.players = [admin];
    this.tetromino = new Tetrominos();
    this.active = false;
    this.admin = admin;
    this.maxPlayers = maxPlayers;
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
    if (this.active) return false;
    if (this.isFull()) return false;
    this.players.push(player);
    return true;
  }

  removePlayer(playerId: number) {
    this.players = this.players.filter((p) => p.id !== playerId);
    if (!this.players.length) {
      this.end();
    }
  }

  handlePlayerDeath(deadPlayer: Player) {
    deadPlayer.socket?.emit(Events.GAME_ENDED, { status: 'loose' });

    const alivePlayers = this.players.filter((p) => p.alive);

    if (alivePlayers.length === 1 && this.players.length > 1) {
      // Multiplayer: last one standing wins
      alivePlayers[0].socket?.emit(Events.GAME_ENDED, { status: 'win' });
      this.end();
    } else if (alivePlayers.length === 0) {
      // Solo game or all dead simultaneously
      this.end();
    }
  }

  distributePenalty(sender: Player, linesCleared: number) {
    const penaltyCount = linesCleared - 1;
    if (penaltyCount <= 0) return;

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
        player.socket?.emit(Events.UPDATED_SPECTRUM, { playerId: senderId, spectrum });
      }
    }
  }

  start() {
    this.active = true;
    this.players.forEach((p) =>
      p.start(
        this.tetromino,
        (data) => this.broadcast(Events.UPDATED_GAME_DATA, { player: data }),
        () => this.handlePlayerDeath(p),
        (count) => this.distributePenalty(p, count),
        (playerId, spectrum) => this.broadcastSpectrum(playerId, spectrum)
      )
    );
  }

  restart() {
    this.tetromino = new Tetrominos();
    this.start();
  }

  end() {
    this.active = false;
    this.players.forEach((p) => {
      if (p.alive) p.forceStop();
    });
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  broadcast(event: string, data: any) {
    for (const player of this.players) {
      player.socket?.emit(event, data);
    }
  }

  toPayload() {
    return {
      id: this.id,
      maxPlayers: this.maxPlayers,
      admin: this.admin?.name,
      active: this.active,
      players: this.players.map((p) => p.toPayload()),
    };
  }
}
