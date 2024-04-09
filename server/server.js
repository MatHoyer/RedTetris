import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { createServer as createViteServer } from 'vite'
import { GameManager } from './gamemanager.js'
import events from '../events/index.js'

const port = process.env.APP_PORT || 3004

async function createMainServer() {
  const app = express()
  const server = http.createServer(app)
  const io = new Server(server)
  const gm = new GameManager()

  io.on('connection', (socket) => {
    console.log(`new client: ${socket.id}`)
    socket.on(events.NEW_GAME, (evt) => {
      console.log(evt)
    })
    socket.on('disconnect', () => console.log(`client left`))
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
    console.log(`RedTetriss running on http://localhost:${port}`)
  })
}
createMainServer()
