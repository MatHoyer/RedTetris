import events from '../../events/index.js'

const gameToPayload = (game) => ({
  id: game.id,
  createdAt: game.created,
  maxPlayers: game.maxPlayers,
  name: game.name,
  owner: game.owner,
})

export const createGame = (
  io,
  socket,
  gameManager,
  logger,
  { name, maxPlayers }
) => {
  const owner = gameManager.getPlayerFromSocket(socket)
  const game = gameManager.createNewGame(logger, name, owner, maxPlayers)
  socket.emit(events.GAME_CREATED, gameToPayload(game))
  io.emit(
    events.UPDATE_GAMES_LIST,
    gameManager.games
      .map(gameToPayload)
      .sort((a, b) => a.createdAt - b.createdAt)
  )
}
