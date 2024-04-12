/**
 * Payload for creating a new game
 * @param {*} name
 * @param {*} maxPlayers
 * @returns
 */
export const createNewGame = (name, maxPlayers) => ({
  name,
  maxPlayers,
})

/**
 * events names
 */
const NEW_GAME = 'new_game'
const GAME_CREATED = 'game_created'
const GAME_ENDED = 'game_ended'
const UPDATE_GAMES_LIST = 'update_games_list'

const PLAYER_CREATED = 'player_created'

export const events = {
  NEW_GAME,
  GAME_CREATED,
  UPDATE_GAMES_LIST,
  GAME_ENDED,
  PLAYER_CREATED,
}

export default events
