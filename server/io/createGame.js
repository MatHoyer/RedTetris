import events from "../../events/index.js";
import {
  broadCastUpdateGameList,
  gameToPayload,
  updateGameList,
} from "./updateGameList.js";

export const createGame = (
  io,
  socket,
  gameManager,
  logger,
  { name, maxPlayers },
) => {
  const owner = gameManager.getPlayerFromSocket(socket);
  const game = gameManager.createNewGame(logger, name, owner, maxPlayers);
  socket.emit(events.GAME_CREATED, gameToPayload(game));
  updateGameList(io, gameManager);
  broadCastUpdateGameList(socket, gameManager);
};
