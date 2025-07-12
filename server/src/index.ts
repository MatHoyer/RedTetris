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
  TGame,
} from '../../events/index.js';
import { GameManager } from './game/GameManager.js';

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

    socket.on(Events.UPDATE_PLAYER, ({ name }) => {
      const user = gameManager.getPlayer(socket.id);
      user.updatePlayer(name);
      socket.emit(Events.PLAYER_UPDATED, { id: user.id, name: user.name });
    });

    socket.on(Events.JOIN_GAME, ({ gameId }) => {
      const user = gameManager.getPlayer(socket.id);
      if (!user) return;
      gameManager.addPlayerToSession(gameId, user);
    });

    const updateGamesList = () => {
      const games = gameManager.getGameSessions().map((game) => {
        const { tetromino: _, ...filteredGame } = game;

        return {
          ...filteredGame,
          admin: { id: filteredGame.admin.id, name: filteredGame.admin.name },
          players: filteredGame.players.map((player) => ({
            id: player.id,
            name: player.name,
          })),
        };
      });
      socket.emit(Events.UPDATED_GAME_LIST, { sessions: games as TGame[] });
    };
    socket.on(Events.UPDATE_GAMES_LIST, updateGamesList);

    socket.on(Events.NEW_GAME, ({ maxPlayers }) => {
      const admin = gameManager.getPlayer(socket.id);
      const sessionId = gameManager.createGameSession(admin, maxPlayers);
      if (!sessionId) {
        socket.emit(Events.ERROR, { message: 'Invalid max players' });
        return;
      }

      updateGamesList();
      socket.emit(Events.GAME_CREATED, { gameId: sessionId });
    });

    socket.on(Events.JOIN_GAME, ({ gameId }) => {
      const user = gameManager.getPlayer(socket.id);
      if (!user) return;
      gameManager.addPlayerToSession(gameId, user);
      updateGamesList();
      socket.emit(Events.GAME_JOINED, { gameId });
    });

    socket.on(Events.LEAVE_GAME, ({ gameId }) => {
      const user = gameManager.getPlayer(socket.id);
      if (!user) return;
      gameManager.removePlayerFromSession(gameId, user.id);
      updateGamesList();
    });

    socket.on('disconnect', () => {
      console.log('Disconnect', socket.id);
      const playerId = gameManager.removePlayer(socket.id);
      if (!playerId) return;
      updateGamesList();
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
