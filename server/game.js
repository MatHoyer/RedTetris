import { randomUUID } from 'crypto'

export class Game {
  constructor(name, gravitySpeed) {
    this._id = randomUUID()
    this._players = []
    this._grativyLoop = null
    this._gravitySpeed = gravitySpeed
    this._started = false
    this._currentPiece = null
    this._name = name
  }

  addPlayer(player) {
    this._players.push(player)
  }

  updatePlayerBoards(players) {
    for (const player of players) {
      player.updateBoard()
    }
  }

  startGame() {
    this.game.started = true
    this._grativyLoop = setInterval(() => {
      this.updatePlayerBoards(this._players)
    }, this._gravitySpeed)
  }
}
