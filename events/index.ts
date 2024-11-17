export const createNewGame = (name: string, maxPlayers: number) => ({
  name,
  maxPlayers,
});

export enum Events {
  NEW_GAME = "new_game",
  GAME_CREATED = "game_created",
  GAME_ENDED = "game_ended",
  UPDATE_GAMES_LIST = "update_games_list",
  UPDATED_GAME_LIST = "updated_game_list",
  JOIN_GAME = "join_game",
  LEAVE_GAME = "leave_game",
  PLAYER_CREATED = "player_created",
  PLAYER_UPDATED = "player_updated",
  PLAYER_DISCONNECTED = "player_disconnected",
  PING = "ping",
  ERROR = "error",
}

export interface ServerToClientEvents {
  [Events.GAME_CREATED]: (evt: { name: string; maxPlayers: number }) => void;
  [Events.GAME_ENDED]: () => void;
  [Events.UPDATED_GAME_LIST]: (evt: {
    sessions: {
      id: number;
      admin: string | undefined;
      active: boolean;
      players: {
        id: number;
        name: string;
        alive: boolean;
        board: number[][];
      }[];
    }[];
  }) => void;
  [Events.PLAYER_CREATED]: (evt: { id: number }) => void;
  [Events.PLAYER_UPDATED]: (evt: { id: number; name: string }) => void;
  [Events.PLAYER_DISCONNECTED]: (evt: { id: number }) => void;
  [Events.ERROR]: (evt: { message: string }) => void;
}

export interface ClientToServerEvents {
  [Events.NEW_GAME]: (evt: { name: string; maxPlayers: number }) => void;
  [Events.UPDATE_GAMES_LIST]: () => void;
  [Events.JOIN_GAME]: (evt: { gameId: number }) => void;
  [Events.LEAVE_GAME]: (evt: { gameId: number }) => void;
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
