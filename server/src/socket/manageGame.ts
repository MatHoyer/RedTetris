import { Server, Socket } from 'socket.io';
import { Events } from '../../../events/index.js';
import { GameManager } from '../game/GameManager.js';

export const handleManageGame = (
  socket: Socket,
  gameManager: GameManager,
  updateGamesList: (sendTo: Socket | Server, gameManager: GameManager) => void
) => {
  socket.on(Events.JOIN_GAME, ({ gameId }) => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.addPlayerToSession(gameId, user);
  });

  socket.on(Events.UPDATE_GAMES_LIST, () => updateGamesList(socket, gameManager));

  socket.on(Events.NEW_GAME, ({ maxPlayers }) => {
    const admin = gameManager.getPlayer(socket.id);
    const sessionId = gameManager.createGameSession(admin, maxPlayers);
    if (!sessionId) {
      socket.emit(Events.ERROR, { message: 'Invalid max players' });
      return;
    }

    updateGamesList(socket, gameManager);
    socket.emit(Events.GAME_CREATED, { gameId: sessionId });
  });

  socket.on(Events.JOIN_GAME, ({ gameId }) => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.addPlayerToSession(gameId, user);
    updateGamesList(socket, gameManager);
    socket.emit(Events.GAME_JOINED, { gameId });
  });

  socket.on(Events.LEAVE_GAME, ({ gameId }) => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.removePlayerFromSession(gameId, user.id);
    updateGamesList(socket, gameManager);
  });

  socket.on(Events.LEAVE_GAMES, () => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.removePlayerFromSessions(socket.id);
    updateGamesList(socket, gameManager);
  });

  socket.on(Events.GAME_START, ({ gameId }) => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const game = gameManager.getGameSession(gameId);
    game.broadcast(Events.GAME_STARTED, { gameId });
    game.start();
    updateGamesList(socket, gameManager);
  });
};
