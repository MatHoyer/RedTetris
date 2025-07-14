export type TGame = {
  id: number;
  admin: {
    id: number;
    name: string;
  };
  active: boolean;
  maxPlayers: number;
  players: {
    id: number;
    name: string;
    alive: boolean;
    board: number[][];
  }[];
};

export enum Events {
  NEW_GAME = 'new_game',
  GAME_CREATED = 'game_created',
  GAME_ENDED = 'game_ended',
  UPDATE_GAMES_LIST = 'update_games_list',
  UPDATED_GAME_LIST = 'updated_game_list',
  JOIN_GAME = 'join_game',
  GAME_JOINED = 'game_joined',
  GAME_START = 'game_start',
  GAME_STARTED = 'game_started',
  LEAVE_GAME = 'leave_game',
  LEAVE_GAMES = 'leave_games',
  PLAYER_CREATED = 'player_created',
  UPDATE_PLAYER = 'update_player',
  PLAYER_UPDATED = 'player_updated',
  PLAYER_DISCONNECTED = 'player_disconnected',
  PING = 'ping',
  ERROR = 'error',
}

export interface ServerToClientEvents {
  [Events.GAME_CREATED]: (evt: { gameId: number }) => void;
  [Events.GAME_JOINED]: (evt: { gameId: number }) => void;
  [Events.GAME_STARTED]: (evt: { gameId: number }) => void;
  [Events.GAME_ENDED]: () => void;
  [Events.UPDATED_GAME_LIST]: (evt: { sessions: TGame[] }) => void;
  [Events.PLAYER_CREATED]: (evt: { id: number }) => void;
  [Events.PLAYER_UPDATED]: (evt: { id: number; name: string }) => void;
  [Events.PLAYER_DISCONNECTED]: (evt: { id: number }) => void;
  [Events.ERROR]: (evt: { message: string }) => void;
}

export interface ClientToServerEvents {
  [Events.NEW_GAME]: (evt: { maxPlayers: number }) => void;
  [Events.GAME_START]: (evt: { gameId: number }) => void;
  [Events.UPDATE_PLAYER]: (evt: { name: string }) => void;
  [Events.UPDATE_GAMES_LIST]: () => void;
  [Events.JOIN_GAME]: (evt: { gameId: number }) => void;
  [Events.LEAVE_GAME]: (evt: { gameId: number }) => void;
  [Events.LEAVE_GAMES]: () => void;
}

export interface InterServerEvents {
  [Events.PING]: () => void;
}

export interface SocketData {
  playerId: number;
  gameId: number;
  name: string;
  maxPlayers: number;
  socketId: string;
}
