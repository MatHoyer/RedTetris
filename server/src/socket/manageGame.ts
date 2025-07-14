import { Server, Socket } from 'socket.io';
import { Events, TGame } from '../../../events/index.js';
import { GameManager } from '../game/GameManager.js';

export const updateGamesList = (sendTo: Socket | Server, gameManager: GameManager) => {
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
  sendTo.emit(Events.UPDATED_GAME_LIST, { sessions: games as TGame[] });
};

export const handleManageGame = (socket: Socket, gameManager: GameManager) => {
  socket.on(Events.JOIN_GAME, ({ gameId }) => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.addPlayerToSession(gameId, user);
  });

  socket.on(Events.UPDATE_GAMES_LIST, updateGamesList);

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
};
