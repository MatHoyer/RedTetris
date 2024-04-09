import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { createServer as createViteServer } from 'vite'

const port = process.env.APP_PORT || 3004

async function createMainServer() {
  const app = express()
  const server = http.createServer(app)
  const io = new Server(server)
  io.on('connection', (socket) => {
    console.log(`user connected ${socket.id}`)
    socket.on('disconnect', () => {
      console.log(`user disconnected ${socket.id}`)
    })
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
