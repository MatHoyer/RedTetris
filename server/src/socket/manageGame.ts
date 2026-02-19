import { Server, Socket } from 'socket.io';
import { Events } from '../../../events/index.js';
import { GameManager } from '../game/GameManager.js';

export const handleManageGame = (
  socket: Socket,
  gameManager: GameManager,
  updateGamesList: (sendTo: Socket | Server, gameManager: GameManager) => void
) => {
  socket.on(Events.UPDATE_GAMES_LIST, () => updateGamesList(socket, gameManager));

  socket.on(Events.NEW_GAME, ({ roomName, maxPlayers }) => {
    const admin = gameManager.getPlayer(socket.id);
    const createdRoomName = gameManager.createGameSession(admin, maxPlayers, roomName);
    if (!createdRoomName) {
      socket.emit(Events.ERROR, { message: 'Invalid room name or max players' });
      return;
    }

    updateGamesList(socket, gameManager);
    socket.emit(Events.GAME_CREATED, { roomName: createdRoomName });
  });

  socket.on(Events.JOIN_GAME, ({ roomName }) => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const joined = gameManager.addPlayerToSession(roomName, user);
    if (!joined) {
      socket.emit(Events.ERROR, { message: 'Cannot join game' });
      return;
    }
    updateGamesList(socket, gameManager);
    socket.emit(Events.GAME_JOINED, { roomName });
  });

  socket.on(Events.LEAVE_GAME, ({ roomName }) => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.removePlayerFromSession(roomName, user.id);
    updateGamesList(socket, gameManager);
  });

  socket.on(Events.LEAVE_GAMES, () => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.removePlayerFromSessions(socket.id);
    updateGamesList(socket, gameManager);
  });

  socket.on(Events.GAME_RESTART, ({ roomName }) => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const game = gameManager.getGameSession(roomName);
    if (!game) return;
    if (!game.isAdmin(user.id)) {
      socket.emit(Events.ERROR, { message: 'Only the admin can restart the game' });
      return;
    }
    if (game.active) {
      socket.emit(Events.ERROR, { message: 'Game is still active' });
      return;
    }
    game.broadcast(Events.GAME_STARTED, { roomName });
    game.restart();
    updateGamesList(socket, gameManager);
  });

  socket.on(Events.GAME_START, ({ roomName }) => {
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const game = gameManager.getGameSession(roomName);
    if (!game) return;
    if (!game.isAdmin(user.id)) {
      socket.emit(Events.ERROR, { message: 'Only the admin can start the game' });
      return;
    }
    game.broadcast(Events.GAME_STARTED, { roomName });
    game.start();
    updateGamesList(socket, gameManager);
  });
};
