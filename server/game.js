import { randomUUID } from 'crypto'

export class Game {
  constructor(logger, name, owner, maxPlayers, gravitySpeed = 300) {
    this._logger = logger
    this.created = new Date()
    this.id = randomUUID()
    this._players = []
    this._grativyLoop = null
    this._gravitySpeed = gravitySpeed
    this.started = false
    this._currentPiece = null
    this.name = name
    this.owner = owner
    this.maxPlayers = maxPlayers
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
    this._logger.info(`starting game ${this.id} - ${this._name}`)
    this.game.started = true
    this._grativyLoop = setInterval(() => {
      this.updatePlayerBoards(this._players)
    }, this._gravitySpeed)
  }

  endGame() {
    this._logger.info(`ending game ${this.id} - ${this._name}`)
    clearInterval(this._grativyLoop)
    this._started = false
  }
}
