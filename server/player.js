import { randomUUID } from 'crypto'

export class Player {
  constructor(logger, name, socket) {
    this._logger = logger
    this.socket = socket || null
    this.id = randomUUID()
    this.name = name || ''
    this._logger.info(
      `new player: ${this.id} - ${this.name} - ${this.socket.id}`
    )
  }
}
