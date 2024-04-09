import { randomUUID } from 'crypto'

export class Player {
  constructor(socket) {
    this.socket = socket || null
    this.id = randomUUID()
    this.name = ''
  }
}
