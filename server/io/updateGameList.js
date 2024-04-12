import events from '../../events/index.js'

export const gameToPayload = (game) => {
  return {
    id: game.id,
    createdAt: game.created,
    maxPlayers: game.maxPlayers,
    name: game.name,
    status: game.status,
    owner: game.owner.name,
  }
}

const getGamesList = (gameManager) => {
  return gameManager.games
    .map(gameToPayload)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export const updateGameList = (io, gameManager) => {
  io.emit(events.UPDATE_GAMES_LIST, getGamesList(gameManager))
}

export const broadCastUpdateGameList = (socket, gameManager) => {
  socket.broadcast.emit(events.UPDATE_GAMES_LIST, getGamesList(gameManager))
}
