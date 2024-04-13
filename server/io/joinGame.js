import events from '../../events/index.js'
import {
  broadCastUpdateGameList,
  gameToPayload,
  updateGameList,
} from './updateGameList.js'

export const joinGame = (io, socket, gameManager, id) => {
  const player = gameManager.getPlayerFromSocket(socket)
  const game = gameManager.getGameById(id)
  if (game.isPlayerInGame(player)) game.addPlayer(player)
  socket.emit(events.JOIN_GAME, gameToPayload(game))
  updateGameList(io, gameManager)
  broadCastUpdateGameList(socket, gameManager)
}
