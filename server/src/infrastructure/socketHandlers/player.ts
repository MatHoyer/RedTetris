import { Socket } from 'socket.io';
import { Events } from '../../../../events/index.js';
import { GameManager } from '../../domain/GameManager.js';
import logger from '../../logger.js';

const log = logger.child({ component: 'Player' });
const nameRegex = /^[a-zA-Z0-9]+$/;

export const handlePlayerEvents = (socket: Socket, gameManager: GameManager) => {
  socket.on(Events.UPDATE_PLAYER, ({ name }) => {
    const user = gameManager.getPlayer(socket.id);
    log.info(`${socket.id} attempting name change to "${name}"`);

    if (name.length < 3 || name.length > 16) {
      log.warn(`${socket.id} name rejected: must be between 3 and 16 characters`);
      socket.emit(Events.UPDATE_PLAYER_ERROR, { message: 'Name must be between 3 and 16 characters' });
      return;
    }
    if (!nameRegex.test(name)) {
      log.warn(`${socket.id} name rejected: contains invalid characters`);
      socket.emit(Events.UPDATE_PLAYER_ERROR, { message: 'Name can only contain letters and numbers' });
      return;
    }
    if (Object.values(gameManager.players).some((player) => player.name === name && player.id !== user.id)) {
      log.warn(`${socket.id} name rejected: "${name}" already exists`);
      socket.emit(Events.UPDATE_PLAYER_ERROR, { message: 'Name already exists' });
      return;
    }

    user.updatePlayer(name);
    log.info(`${socket.id} name set to "${name}"`);
    socket.emit(Events.PLAYER_UPDATED, { id: user.id, name: user.name });
  });
};
