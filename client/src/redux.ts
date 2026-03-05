import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { TGame, TShape, TTetromino } from '../../events';
import { EmptyCell, type TCell } from './globals';

// ================User================
const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: -1,
    name: '',
  },
  reducers: {
    changeId: (state, action) => {
      state.id = action.payload;
    },
    changeName: (state, action) => {
      state.name = action.payload;
    },
  },
});

export const { changeId, changeName } = userSlice.actions;

// ================GameList================
const gamesListSlice = createSlice({
  name: 'gamesList',
  initialState: [] as TGame[],
  reducers: {
    updateGamesList: (state, action) => {
      return action.payload;
    },
  },
});

export const { updateGamesList } = gamesListSlice.actions;

// ================Board================
const createBoard = () => {
  const returnArray = Array(20)
    .fill(null)
    .map(() => Array(10).fill(EmptyCell)) as TCell[][];

  return returnArray;
};

const boardSlice = createSlice({
  name: 'board',
  initialState: createBoard(),
  reducers: {
    updateBoard: (state, action) => {
      return action.payload;
    },
    resetBoard: () => {
      return createBoard();
    },
  },
});

export const { updateBoard, resetBoard } = boardSlice.actions;

// ================Game================
const gameInitialState = {
  score: 0,
  nextPiece: { nextPiece: 'empty' as TTetromino | 'empty', nextPieceShape: [] as TShape },
  status: null as 'win' | 'loose' | null,
  otherPlayersData: [] as { id: number; name: string; alive: boolean; score: number }[],
  spectrums: {} as Record<number, number[]>,
};

const gameSlice = createSlice({
  name: 'game',
  initialState: gameInitialState,
  reducers: {
    setScore: (state, action) => {
      state.score = action.payload;
    },
    setNextPiece: (state, action) => {
      state.nextPiece = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    updatePlayerData: (state, action) => {
      const player = action.payload;
      const index = state.otherPlayersData.findIndex((p) => p.id === player.id);
      if (index === -1) {
        state.otherPlayersData.push(player);
      } else {
        state.otherPlayersData[index] = player;
      }
    },
    updateSpectrum: (state, action) => {
      const { playerId, spectrum } = action.payload;
      state.spectrums[playerId] = spectrum;
    },
    resetGame: () => {
      return { ...gameInitialState, otherPlayersData: [], spectrums: {} };
    },
  },
});

export const { setScore, setNextPiece, setStatus, updatePlayerData, updateSpectrum, resetGame } = gameSlice.actions;

// ================Store================
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    gamesList: gamesListSlice.reducer,
    board: boardSlice.reducer,
    game: gameSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
