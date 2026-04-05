import { Router } from 'express';
import { Server } from 'socket.io';
import { Events } from '../../../events/index.js';
import { GameManager } from '../domain/GameManager.js';
import logger from '../logger.js';
import { listHighScoresPaginated } from './save-score.js';

const log = logger.child({ component: 'API' });
const nameRegex = /^[a-zA-Z0-9]+$/;

export function createRouter(gameManager: GameManager, io: Server) {
  const router = Router();

  const broadcastGamesList = () => {
    const sessions = gameManager.getGameSessions().map((game) => game.toPayload());
    io.emit(Events.UPDATED_GAME_LIST, { sessions });
  };

  const getPlayerFromSocket = (socketId: string | undefined) => {
    if (!socketId) return undefined;
    return gameManager.getPlayer(socketId);
  };

  router.put('/api/player', (req, res) => {
    const { name } = req.body;
    const socketId = req.headers['x-socket-id'] as string;
    const user = getPlayerFromSocket(socketId);
    if (!user) return res.status(401).json({ error: 'Player not found' });

    log.info(`${socketId} attempting name change to "${name}"`);

    if (!name || name.length < 3 || name.length > 16) {
      return res.status(400).json({ error: 'Name must be between 3 and 16 characters' });
    }
    if (!nameRegex.test(name)) {
      return res.status(400).json({ error: 'Name can only contain letters and numbers' });
    }
    if (Object.values(gameManager.players).some((player) => player.name === name && player.id !== user.id)) {
      return res.status(409).json({ error: 'Name already exists' });
    }

    user.updatePlayer(name);
    log.info(`${socketId} name set to "${name}"`);
    res.json({ id: user.id, name: user.name });
  });

  router.get('/api/games', (_req, res) => {
    const sessions = gameManager.getGameSessions().map((game) => game.toPayload());
    res.json({ sessions });
  });

  router.post('/api/games', (req, res) => {
    const { roomName, maxPlayers } = req.body;
    const socketId = req.headers['x-socket-id'] as string;
    const admin = getPlayerFromSocket(socketId);
    if (!admin) return res.status(401).json({ error: 'Player not found' });

    log.info(`${socketId} creating room "${roomName}" (max: ${maxPlayers})`);
    const createdRoomName = gameManager.createGameSession(admin, maxPlayers, roomName);
    if (!createdRoomName) {
      return res.status(400).json({ error: 'Invalid room name or room already exists' });
    }

    broadcastGamesList();
    res.json({ roomName: createdRoomName });
  });

  router.post('/api/games/:roomName/join', (req, res) => {
    const { roomName } = req.params;
    const socketId = req.headers['x-socket-id'] as string;
    const user = getPlayerFromSocket(socketId);
    if (!user) return res.status(401).json({ error: 'Player not found' });

    log.info(`${socketId} joining room "${roomName}"`);
    const joined = gameManager.addPlayerToSession(roomName, user);
    if (!joined) {
      return res.status(400).json({ error: 'Cannot join game' });
    }

    broadcastGamesList();
    res.json({ roomName });
  });

  router.post('/api/games/:roomName/leave', (req, res) => {
    const { roomName } = req.params;
    const socketId = req.headers['x-socket-id'] as string;
    const user = getPlayerFromSocket(socketId);
    if (!user) return res.status(401).json({ error: 'Player not found' });

    log.info(`${socketId} leaving room "${roomName}"`);
    gameManager.removePlayerFromSession(roomName, user.id);
    broadcastGamesList();
    io.emit(Events.PLAYER_DISCONNECTED, { id: user.id });
    res.json({ ok: true });
  });

  router.post('/api/games/leave-all', (req, res) => {
    const socketId = (req.body?.socketId as string) || (req.headers['x-socket-id'] as string);
    const user = getPlayerFromSocket(socketId);
    if (!user) return res.status(401).json({ error: 'Player not found' });

    log.info(`${socketId} leaving all rooms`);
    gameManager.removePlayerFromSessions(socketId);
    broadcastGamesList();
    io.emit(Events.PLAYER_DISCONNECTED, { id: user.id });
    res.json({ ok: true });
  });

  router.post('/api/games/:roomName/start', (req, res) => {
    const { roomName } = req.params;
    const socketId = req.headers['x-socket-id'] as string;
    const user = getPlayerFromSocket(socketId);
    if (!user) return res.status(401).json({ error: 'Player not found' });

    const game = gameManager.getGameSession(roomName);
    if (!game) return res.status(404).json({ error: 'Room not found' });
    if (!game.isAdmin(user.id)) return res.status(403).json({ error: 'Only the admin can start the game' });
    if (game.active) return res.status(400).json({ error: 'Game is already active' });

    log.info(`${socketId} starting room "${roomName}"`);
    game.broadcastGameStarted(roomName);
    game.start();
    broadcastGamesList();
    res.json({ ok: true });
  });

  router.get('/api/high-scores', async (req, res) => {
    try {
      const pageRaw = parseInt(String(req.query.page ?? '1'), 10);
      const limitRaw = parseInt(String(req.query.limit ?? '10'), 10);
      const page = Math.max(1, Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1);
      const limit = Math.min(50, Math.max(1, Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10));

      const { items, total } = await listHighScoresPaginated(page, limit);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      res.json({
        items,
        total,
        page,
        pageSize: limit,
        totalPages,
      });
    } catch (e) {
      log.error(e, 'GET /api/high-scores failed');
      res.status(500).json({ error: 'Failed to load high scores' });
    }
  });

  router.post('/api/games/:roomName/restart', (req, res) => {
    const { roomName } = req.params;
    const socketId = req.headers['x-socket-id'] as string;
    const user = getPlayerFromSocket(socketId);
    if (!user) return res.status(401).json({ error: 'Player not found' });

    const game = gameManager.getGameSession(roomName);
    if (!game) return res.status(404).json({ error: 'Room not found' });
    if (!game.isAdmin(user.id)) return res.status(403).json({ error: 'Only the admin can restart the game' });
    if (game.active) return res.status(400).json({ error: 'Game is still active' });

    log.info(`${socketId} restarting room "${roomName}"`);
    game.broadcastGameStarted(roomName);
    game.restart();
    broadcastGamesList();
    res.json({ ok: true });
  });

  return { router, broadcastGamesList };
}
