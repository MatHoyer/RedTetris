import { Game } from './game.js'
import { Player } from './player.js'

export class GameManager {
  constructor(logger) {
    this._logger = logger
    this.games = []
    this.players = []
  }

  createNewGame(logger, name, owner, maxPlayers) {
    const game = new Game(logger, name, owner, maxPlayers)
    game.addPlayer(owner)
    this.games.push(game)
    return game
  }

  createPlayer(logger, name, socket) {
    const player = new Player(logger, name, socket)
    this.players.push(player)
    return player
  }

  getPlayerFromSocket(socket) {
    return this.players.find((p) => p.socket.id === socket.id)
  }

  getPlayerFromId(id) {
    return this.players.find((p) => p.id === id)
  }
}
