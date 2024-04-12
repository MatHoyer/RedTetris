import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { createServer as createViteServer } from 'vite'
import { GameManager } from './gamemanager.js'
import { Logger } from './logger.js'

const port = process.env.APP_PORT || 3004

async function createMainServer() {
  const app = express()
  const server = http.createServer(app)
  const logger = new Logger(console)
  const io = new Server(server)
  new GameManager(logger, io)

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
    console.log(`RedTetriss running on http://localhost:${port}`)
  })
}
createMainServer()
