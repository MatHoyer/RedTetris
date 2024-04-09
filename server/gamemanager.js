import { Game } from './game.js'

export class GameManager {
  constructor(io) {
    this._io = io
    this._games = []
    this._players = []
  }

  createNewGame(players) {
    this._games.push(new Game(players))
  }
}
