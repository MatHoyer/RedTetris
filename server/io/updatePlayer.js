import events from '../../events/index.js'

export const updatePlayerName = (socket, gameManager, newName) => {
  console.log('updatePlayerName', newName)
  const player = gameManager.getPlayerFromSocket(socket)
  player.name = newName
  socket.emit(events.PLAYER_UPDATED, player.name)
}
