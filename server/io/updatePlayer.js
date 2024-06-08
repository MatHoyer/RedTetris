import events from "../../events/index.js";

export const updatePlayerName = (socket, gameManager, newName) => {
  const player = gameManager.getPlayerFromSocket(socket);
  if (gameManager.isPlayerNameGood(newName)) {
    player.name = newName;
    socket.emit(events.PLAYER_UPDATED, player.name);
  } else {
    socket.emit(events.PLAYER_UPDATED, "error");
  }
};
