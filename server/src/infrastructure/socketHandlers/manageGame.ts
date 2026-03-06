import { Socket } from 'socket.io';
import { Events } from '../../../../events/index.js';
import { GameManager } from '../../domain/GameManager.js';
import logger from '../../logger.js';

const log = logger.child({ component: 'Game' });

export const handleManageGame = (socket: Socket, gameManager: GameManager, broadcastGamesList: () => void) => {
  socket.on(Events.UPDATE_GAMES_LIST, () => {
    log.info(`${socket.id} requested games list`);
    broadcastGamesList();
  });

  socket.on(Events.NEW_GAME, ({ roomName, maxPlayers }) => {
    log.info(`${socket.id} creating room "${roomName}" (max: ${maxPlayers})`);
    const admin = gameManager.getPlayer(socket.id);
    const createdRoomName = gameManager.createGameSession(admin, maxPlayers, roomName);
    if (!createdRoomName) {
      log.warn(`Failed to create room "${roomName}" for ${socket.id}`);
      socket.emit(Events.ERROR, { message: 'Invalid room name or max players' });
      return;
    }

    broadcastGamesList();
    socket.emit(Events.GAME_CREATED, { roomName: createdRoomName });
  });

  socket.on(Events.JOIN_GAME, ({ roomName }) => {
    log.info(`${socket.id} joining room "${roomName}"`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const joined = gameManager.addPlayerToSession(roomName, user);
    if (!joined) {
      log.warn(`${socket.id} failed to join "${roomName}"`);
      socket.emit(Events.ERROR, { message: 'Cannot join game' });
      return;
    }
    broadcastGamesList();
    socket.emit(Events.GAME_JOINED, { roomName });
  });

  socket.on(Events.LEAVE_GAME, ({ roomName }) => {
    log.info(`${socket.id} leaving room "${roomName}"`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.removePlayerFromSession(roomName, user.id);
    broadcastGamesList();
  });

  socket.on(Events.LEAVE_GAMES, () => {
    log.info(`${socket.id} leaving all rooms`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    gameManager.removePlayerFromSessions(socket.id);
    broadcastGamesList();
  });

  socket.on(Events.GAME_RESTART, ({ roomName }) => {
    log.info(`${socket.id} restarting room "${roomName}"`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const game = gameManager.getGameSession(roomName);
    if (!game) {
      log.warn(`${socket.id} restart failed: room "${roomName}" not found`);
      return;
    }
    if (!game.isAdmin(user.id)) {
      log.warn(`${socket.id} restart rejected: not admin of "${roomName}"`);
      socket.emit(Events.ERROR, { message: 'Only the admin can restart the game' });
      return;
    }
    if (game.active) {
      log.warn(`${socket.id} restart rejected: "${roomName}" still active`);
      socket.emit(Events.ERROR, { message: 'Game is still active' });
      return;
    }
    game.broadcastGameStarted(roomName);
    game.restart();
    broadcastGamesList();
  });

  socket.on(Events.GAME_START, ({ roomName }) => {
    log.info(`${socket.id} starting room "${roomName}"`);
    const user = gameManager.getPlayer(socket.id);
    if (!user) return;
    const game = gameManager.getGameSession(roomName);
    if (!game) {
      log.warn(`${socket.id} start failed: room "${roomName}" not found`);
      return;
    }
    if (!game.isAdmin(user.id)) {
      log.warn(`${socket.id} start rejected: not admin of "${roomName}"`);
      socket.emit(Events.ERROR, { message: 'Only the admin can start the game' });
      return;
    }
    game.broadcastGameStarted(roomName);
    game.start();
    broadcastGamesList();
  });
};
