/**
 * Payload for creating a new game
 * @param {*} name
 * @param {*} owner
 * @param {*} maxPlayers
 * @returns
 */
export const createNewGame = (name, owner, maxPlayers) => ({
  name,
  owner,
  maxPlayers,
})

/**
 * events names
 */
const NEW_GAME = 'new_game'
const GAME_CREATED = 'game_created'
const GAME_ENDED = 'game_ended'
const PLAYER_CREATED = 'player_created'

export default {
  NEW_GAME,
  GAME_CREATED,
  PLAYER_CREATED,
  GAME_ENDED,
}
