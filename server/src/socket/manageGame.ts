import { Server, Socket } from 'socket.io';
import { Events } from '../../../events/index.js';
import { GameManager } from '../game/GameManager.js';

export const handleManageGame = (
  socket: Socket,
  gameManager: GameManager,
  updateGamesList: (sendTo: Socket | Server, gameManager: GameManager) => void
) => {
  socket.on(Events.UPDATE_GAMES_LIST, () => {
    console.log(`[Game] ${socket.id} requested games list`);
    updateGamesList(socket, gameManager);
  });

  socket.on(Events.NEW_GAME, ({ roomName, maxPlayers }) => {
    console.log(`[Game] ${socket.id} creating room "${roomName}" (max: ${maxPlayers})`);
    const admin = gameManager.getPlayer(socket.id);
    const createdRoomName = gameManager.createGameSession(admin, maxPlayers, roomName);
    if (!createdRoomName) {
      console.warn(`[Game] Failed to create room "${roomName}" for ${socket.id}`);
      socket.emit(Events.ERROR, { message: 'Invalid room name or max players' });
      return;
    }

    updateGamesList(socket, gameManager);
    socket.emit(Events.GAME_CREATED, { roomName: createdRoomName });
  });

  socket.on(Events.JOIN_GAME, ({ roomName }) => {
    console.log(`[Game] ${socket.id} joining room "${roomName}"`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const joined = gameManager.addPlayerToSession(roomName, user);
    if (!joined) {
      console.warn(`[Game] ${socket.id} failed to join "${roomName}"`);
      socket.emit(Events.ERROR, { message: 'Cannot join game' });
      return;
    }
    updateGamesList(socket, gameManager);
    socket.emit(Events.GAME_JOINED, { roomName });
  });

  socket.on(Events.LEAVE_GAME, ({ roomName }) => {
    console.log(`[Game] ${socket.id} leaving room "${roomName}"`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.removePlayerFromSession(roomName, user.id);
    updateGamesList(socket, gameManager);
  });

  socket.on(Events.LEAVE_GAMES, () => {
    console.log(`[Game] ${socket.id} leaving all rooms`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.removePlayerFromSessions(socket.id);
    updateGamesList(socket, gameManager);
  });

  socket.on(Events.GAME_RESTART, ({ roomName }) => {
    console.log(`[Game] ${socket.id} restarting room "${roomName}"`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const game = gameManager.getGameSession(roomName);
    if (!game) {
      console.warn(`[Game] ${socket.id} restart failed: room "${roomName}" not found`);
      return;
    }
    if (!game.isAdmin(user.id)) {
      console.warn(`[Game] ${socket.id} restart rejected: not admin of "${roomName}"`);
      socket.emit(Events.ERROR, { message: 'Only the admin can restart the game' });
      return;
    }
    if (game.active) {
      console.warn(`[Game] ${socket.id} restart rejected: "${roomName}" still active`);
      socket.emit(Events.ERROR, { message: 'Game is still active' });
      return;
    }
    game.broadcast(Events.GAME_STARTED, { roomName });
    game.restart();
    updateGamesList(socket, gameManager);
  });

  socket.on(Events.GAME_START, ({ roomName }) => {
    console.log(`[Game] ${socket.id} starting room "${roomName}"`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const game = gameManager.getGameSession(roomName);
    if (!game) {
      console.warn(`[Game] ${socket.id} start failed: room "${roomName}" not found`);
      return;
    }
    if (!game.isAdmin(user.id)) {
      console.warn(`[Game] ${socket.id} start rejected: not admin of "${roomName}"`);
      socket.emit(Events.ERROR, { message: 'Only the admin can start the game' });
      return;
    }
    game.broadcast(Events.GAME_STARTED, { roomName });
    game.start();
    updateGamesList(socket, gameManager);
  });
};
