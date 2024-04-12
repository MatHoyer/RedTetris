import { Game } from './game.js'
import events from '../events/index.js'
import { Player } from './player.js'

export class GameManager {
  constructor(logger, io) {
    this._logger = logger
    this._io = io
    this._games = []
    this._players = []

    this._io.on('connection', (socket) => {
      const p = this.createPlayer(this._logger, null, socket)
      socket.emit(events.PLAYER_CREATED, { id: p.id })

      socket.on(events.NEW_GAME, ({ name, owner, maxPlayers }) => {
        const g = this.createNewGame(this._logger, name, owner, maxPlayers)
        socket.emit(events.GAME_CREATED, { id: g.id })
      })

      socket.on('disconnect', () => this._logger.info(`client left`))
    })
  }

  createNewGame(logger, name, owner, maxPlayers) {
    const game = new Game(logger, name, owner, maxPlayers)
    this._games.push(game)
    return game
  }

  createPlayer(logger, name, socket) {
    const player = new Player(logger, name, socket)
    this._players.push(player)
    return player
  }
}
