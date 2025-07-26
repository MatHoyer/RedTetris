import { Player } from './Player.js';
import { Tetrominos } from './Tetrominos.js';

export class GameSession {
  id: number;
  admin: Player;
  maxPlayers: number;
  players: Player[];
  tetromino: Tetrominos;
  active: boolean;

  constructor(id: number, maxPlayers: number, admin: Player) {
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

  addPlayer(player: Player) {
    if (this.isFull()) return;
    this.players.push(player);
  }

  removePlayer(playerId: number) {
    this.players = this.players.filter((p) => p.id !== playerId);
    if (!this.players.length) {
      this.end();
    }
  }

  start() {
    this.active = true;
    this.players.forEach((p) => p.start(this.tetromino));
  }

  end() {
    this.active = false;
    this.players.forEach((p) => p.stop());
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
