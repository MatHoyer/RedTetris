import express from 'express';
import http from 'http';
import { dirname, join } from 'path';
import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  Events,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../events/index.js';
import { GameManager } from './game/GameManager.js';
import { handleGame } from './socket/game.js';
import { handleManageGame, updateGamesList } from './socket/manageGame.js';
import { handlePlayerEvents } from './socket/player.js';

const port = process.env.APP_PORT || 3004;

async function createMainServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);

  const gameManager = new GameManager();

  io.on('connection', (socket) => {
    console.log('New connection', socket.id);
    console.log('Number of players:', io.sockets.sockets.size);
    const playerId = gameManager.createNewPlayer(socket);
    if (!playerId) return;
    socket.emit(Events.PLAYER_CREATED, { id: playerId });

    // // Logger for emit
    // const originalSocketEmit = socket.emit.bind(socket);
    // socket.emit = function (event, ...args) {
    //   console.log(`[socket.emit]`, event, args);
    //   return originalSocketEmit(event, ...args);
    // };

    // // Logger for on
    // socket.onAny((event, ...args) => {
    //   console.log(`[socket.on] event: ${event}`, args);
    // });

    handlePlayerEvents(socket, gameManager);

    handleManageGame(socket, gameManager);

    handleGame(socket, gameManager);

    socket.on('disconnect', () => {
      console.log('Disconnect', socket.id);
      const playerId = gameManager.removePlayer(socket.id);
      if (!playerId) return;
      updateGamesList(io, gameManager);
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
