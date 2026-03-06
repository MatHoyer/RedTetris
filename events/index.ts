export type TGame = {
  id: string;
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

export const tetrominoes = ['I', 'O', 'T', 'J', 'L', 'S', 'Z'] as const;
export type TTetromino = (typeof tetrominoes)[number];

export type TShape = number[][];

export enum Events {
  NEW_GAME = 'new_game',
  GAME_CREATED = 'game_created',
  GAME_ENDED = 'game_ended',
  UPDATE_GAMES_LIST = 'update_games_list',
  UPDATED_GAME_LIST = 'updated_game_list',
  UPDATED_BOARD = 'updated_board',
  UPDATED_SCORE = 'updated_score',
  UPDATED_LEVEL = 'updated_level',
  UPDATED_NEXT_PIECE = 'updated_next_piece',
  UPDATED_GAME_DATA = 'updated_game_data',
  UPDATED_SPECTRUM = 'updated_spectrum',
  JOIN_GAME = 'join_game',
  GAME_JOINED = 'game_joined',
  GAME_START = 'game_start',
  GAME_STARTED = 'game_started',
  GAME_RESTART = 'game_restart',
  LEAVE_GAME = 'leave_game',
  LEAVE_GAMES = 'leave_games',
  PLAYER_CREATED = 'player_created',
  UPDATE_PLAYER = 'update_player',
  UPDATE_PLAYER_ERROR = 'update_player_error',
  PLAYER_UPDATED = 'player_updated',
  PLAYER_DISCONNECTED = 'player_disconnected',
  PING = 'ping',
  ERROR = 'error',

  KEY_DOWN_PRESS = 'key_down_press',
  KEY_DOWN_RELEASE = 'key_down_release',
  KEY_LEFT_PRESS = 'key_left_press',
  KEY_LEFT_RELEASE = 'key_left_release',
  KEY_RIGHT_PRESS = 'key_right_press',
  KEY_RIGHT_RELEASE = 'key_right_release',
  KEY_ROTATE_PRESS = 'key_rotate_press',
  KEY_ROTATE_RELEASE = 'key_rotate_release',
  KEY_HARD_DROP = 'key_hard_drop',
}

export interface ServerToClientEvents {
  [Events.GAME_STARTED]: (evt: { roomName: string }) => void;
  [Events.GAME_ENDED]: (evt: { status: 'win' | 'loose' }) => void;
  [Events.UPDATED_GAME_LIST]: (evt: { sessions: TGame[] }) => void;
  [Events.UPDATED_BOARD]: (evt: { board: (TTetromino | 'empty' | 'penalty')[][] }) => void;
  [Events.UPDATED_SCORE]: (evt: { score: number }) => void;
  [Events.UPDATED_LEVEL]: (evt: { level: number }) => void;
  [Events.UPDATED_NEXT_PIECE]: (evt: { nextPiece: TTetromino; nextPieceShape: TShape }) => void;
  [Events.UPDATED_GAME_DATA]: (evt: {
    player: {
      id: number;
      name: string;
      alive: boolean;
      score: number;
    };
  }) => void;
  [Events.UPDATED_SPECTRUM]: (evt: { playerId: number; spectrum: number[] }) => void;
  [Events.PLAYER_CREATED]: (evt: { id: number }) => void;
  [Events.PLAYER_DISCONNECTED]: (evt: { id: number }) => void;
}

export interface ClientToServerEvents {
  [Events.KEY_DOWN_PRESS]: () => void;
  [Events.KEY_DOWN_RELEASE]: () => void;
  [Events.KEY_LEFT_PRESS]: () => void;
  [Events.KEY_LEFT_RELEASE]: () => void;
  [Events.KEY_RIGHT_PRESS]: () => void;
  [Events.KEY_RIGHT_RELEASE]: () => void;
  [Events.KEY_ROTATE_PRESS]: () => void;
  [Events.KEY_ROTATE_RELEASE]: () => void;
  [Events.KEY_HARD_DROP]: () => void;
}

export interface InterServerEvents {
  [Events.PING]: () => void;
}

export interface SocketData {
  playerId: number;
  roomName: string;
  name: string;
  maxPlayers: number;
  socketId: string;
}
