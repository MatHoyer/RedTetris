import { Socket } from 'socket.io';
import { Events } from '../../../events/index.js';
import { GameManager } from '../game/GameManager.js';

const nameRegex = /^[a-zA-Z0-9]+$/;

export const handlePlayerEvents = (socket: Socket, gameManager: GameManager) => {
  socket.on(Events.UPDATE_PLAYER, ({ name }) => {
    const user = gameManager.getPlayer(socket.id);

    if (name.length < 3 || name.length > 16) {
      socket.emit(Events.UPDATE_PLAYER_ERROR, { message: 'Name must be between 3 and 16 characters' });
      return;
    }
    if (!nameRegex.test(name)) {
      socket.emit(Events.UPDATE_PLAYER_ERROR, { message: 'Name can only contain letters and numbers' });
      return;
    }
    if (Object.values(gameManager.players).some((player) => player.name === name)) {
      socket.emit(Events.UPDATE_PLAYER_ERROR, { message: 'Name already exists' });
      return;
    }

    user.updatePlayer(name);
    socket.emit(Events.PLAYER_UPDATED, { id: user.id, name: user.name });
  });
};
