import { Server } from 'socket.io';
import { Events } from '../../../events/index.js';
import { GameManager } from '../domain/GameManager.js';
import logger from '../logger.js';
import { SocketPlayerAdapter } from './SocketPlayerAdapter.js';
import { handleManageGame } from './socketHandlers/manageGame.js';
import { handlePlayerEvents } from './socketHandlers/player.js';

const log = logger.child({ component: 'Server' });

export function setupSocketHandlers(io: Server, gameManager: GameManager) {
  const broadcastGamesList = () => {
    const sessions = gameManager.getGameSessions().map((game) => game.toPayload());
    io.emit(Events.UPDATED_GAME_LIST, { sessions });
  };

  io.on('connection', (socket) => {
    log.info(`New connection ${socket.id} (${io.sockets.sockets.size} connected)`);
    const adapter = new SocketPlayerAdapter(socket);
    const playerId = gameManager.createNewPlayer(socket.id, adapter);
    if (playerId === undefined) {
      log.warn(`Failed to create player for socket ${socket.id}`);
      return;
    }
    socket.emit(Events.PLAYER_CREATED, { id: playerId });

    handlePlayerEvents(socket, gameManager);
    handleManageGame(socket, gameManager, broadcastGamesList);

    socket.on('disconnect', () => {
      const player = gameManager.getPlayer(socket.id);
      log.info(`Disconnect ${socket.id}${player?.name ? ` (${player.name})` : ''}`);
      const playerId = gameManager.removePlayer(socket.id);
      if (playerId === undefined) return;
      broadcastGamesList();
      io.emit(Events.PLAYER_DISCONNECTED, { id: playerId });
    });
  });
}
