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
const JOIN_GAME = 'join_game'

const PLAYER_CREATED = 'player_created'
const PLAYER_UPDATED = 'player_updated'

export const events = {
  NEW_GAME,
  GAME_CREATED,
  GAME_ENDED,
  UPDATE_GAMES_LIST,
  JOIN_GAME,
  PLAYER_CREATED,
  PLAYER_UPDATED,
}

export default events
