import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { GameManager } from './game/GameManager.js';
import {
  ClientToServerEvents,
  Events,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../events/index.js';
import { dirname, join } from 'path';

const port = process.env.APP_PORT || 3004;

async function createMainServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);

  const gameManager = new GameManager();

  io.on('connection', (socket) => {
    console.log('New connection', socket.id);
    console.log('Number of players:', io.sockets.sockets.size);
    const playerId = gameManager.createNewPlayer(socket.id);
    if (!playerId) return;
    socket.emit(Events.PLAYER_CREATED, { id: playerId });

    socket.on(Events.NEW_GAME, ({ maxPlayers }) => {
      const admin = gameManager.getPlayer(socket.id);
      const sessionId = gameManager.createGameSession(admin, maxPlayers);
      if (!sessionId) {
        socket.emit(Events.ERROR, { message: 'Invalid max players' });

        return;
      }

      socket.emit(Events.GAME_CREATED, { name: 'New Game', maxPlayers });
    });

    socket.on('disconnect', () => {
      console.log('Disconnect', socket.id);
      const playerId = gameManager.removePlayer(socket.id);
      if (!playerId) return;
      io.emit(Events.PLAYER_DISCONNECTED, { id: playerId });
    });
  });

  app.use(express.static(join(dirname(import.meta.dirname), '../client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: join(dirname(import.meta.dirname), '../client', 'dist') });
  });

  server.listen(port, () => {
    console.info(`RedTetris running on http://localhost:${port}`);
  });
}

createMainServer();
