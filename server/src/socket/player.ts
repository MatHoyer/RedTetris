import { Socket } from 'socket.io';
import { Events } from '../../../events/index.js';
import { GameManager } from '../game/GameManager.js';

export const handlePlayerEvents = (socket: Socket, gameManager: GameManager) => {
  socket.on(Events.UPDATE_PLAYER, ({ name }) => {
    const user = gameManager.getPlayer(socket.id);
    user.updatePlayer(name);
    socket.emit(Events.PLAYER_UPDATED, { id: user.id, name: user.name });
  });
};
