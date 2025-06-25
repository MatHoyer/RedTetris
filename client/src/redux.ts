import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { TGame } from '../../events';

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
    .map(() => Array(10).fill(0));

  returnArray[1][1] = 1;
  returnArray[1][2] = 1;
  returnArray[1][3] = 1;

  return returnArray;
};

const boardSlice = createSlice({
  name: 'board',
  initialState: createBoard(),
  reducers: {
    updateBoard: (state, action) => {
      state = action.payload;
    },
  },
});

export const { updateBoard } = boardSlice.actions;

// ================Store================
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    gamesList: gamesListSlice.reducer,
    board: boardSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
