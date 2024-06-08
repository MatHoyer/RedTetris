import { broadCastUpdateGameList, updateGameList } from "./updateGameList.js";

export const leaveGame = (io, socket, gameManager, id) => {
  const player = gameManager.getPlayerFromSocket(socket);
  const game = gameManager.getGameById(id);
  if (!game || !player) {
    return;
  }
  game.removePlayer(player);
  if (game._players.length === 0) {
    gameManager.removeGame(game);
  } else if (game.owner.name === player.name) {
    const newOwner = game._players[0];
    game.owner = newOwner;
  }
  // socket.emit(events.LEAVE_GAME, gameToPayload(game))
  updateGameList(io, gameManager);
  broadCastUpdateGameList(socket, gameManager);
};
