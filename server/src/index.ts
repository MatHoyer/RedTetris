import express from 'express';
import http from 'http';
import { join } from 'path';
import { Server } from 'socket.io';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from '../../events/index.js';
import { GameManager } from './domain/GameManager.js';
import { setupSocketHandlers } from './infrastructure/socketSetup.js';
import logger from './logger.js';

const port = process.env.APP_PORT || 3004;

const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);

const gameManager = new GameManager();
setupSocketHandlers(io, gameManager);

const clientDir = join(process.cwd(), 'client', 'dist');
app.use(express.static(clientDir));
app.get('/{*path}', (_req, res) => {
  res.sendFile('index.html', { root: clientDir });
});

server.listen(port, () => {
  logger.info(`RedTetris running on http://localhost:${port}`);
});
