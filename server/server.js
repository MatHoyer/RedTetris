import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { createServer as createViteServer } from 'vite'
import { GameManager } from './gamemanager.js'
import { Logger } from './logger.js'
import events from '../events/index.js'
import { createGame } from './io/create-game.js'
import { updateGameList } from './io/updateGameList.js'

const port = process.env.APP_PORT || 3004

async function createMainServer() {
  const app = express()
  const server = http.createServer(app)
  const logger = new Logger(console)
  const io = new Server(server)
  const gameManager = new GameManager(logger, io)

  io.on('connection', (socket) => {
    const p = gameManager.createPlayer(logger, null, socket)
    socket.emit(events.PLAYER_CREATED, { id: p.id })
    socket.on(events.NEW_GAME, (evt) =>
      createGame(io, socket, gameManager, logger, evt)
    )
    socket.on(events.UPDATE_GAMES_LIST, () => updateGameList(io, gameManager))

    socket.on('disconnect', () => logger.info(`client left`))
  })

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
    },
    appType: 'spa',
  })
  app.use(vite.middlewares)
  server.listen(port, () => {
    console.log(`RedTetris running on http://localhost:${port}`)
  })
}
createMainServer()
