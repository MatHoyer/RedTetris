import { configureStore, createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TGame, TGameMode, TShape, TTetromino } from '../../events';
import { api } from './api';
import { EmptyCell, type TCell } from './globals';

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
  extraReducers: (builder) => {
    builder.addCase(updatePlayer.fulfilled, (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
    });
  },
});

export const { changeId, changeName } = userSlice.actions;

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
    markOtherPlayerDead: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const p = state.otherPlayersData.find((x) => x.id === id);
      if (p) p.alive = false;
    },
    resetGame: () => {
      return gameInitialState;
    },
  },
});

export const { setScore, setNextPiece, setStatus, updatePlayerData, updateSpectrum, markOtherPlayerDead, resetGame } =
  gameSlice.actions;

export const updatePlayer = createAsyncThunk('user/updatePlayer', async (name: string, { rejectWithValue }) => {
  try {
    const res = await api.updatePlayer(name);
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? 'Connection not ready, try again');
    return data as { id: number; name: string };
  } catch {
    return rejectWithValue('Network error');
  }
});

export const createGame = createAsyncThunk(
  'games/create',
  async (params: { roomName: string; maxPlayers: number; modes?: TGameMode[] }, { rejectWithValue }) => {
    try {
      const res = await api.createGame(params.roomName, params.maxPlayers, params.modes ?? []);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data as { roomName: string };
    } catch {
      return rejectWithValue('Network error');
    }
  },
);

export const joinGame = createAsyncThunk('games/join', async (roomName: string, { rejectWithValue }) => {
  try {
    const res = await api.joinGame(roomName);
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error);
    return data as { roomName: string };
  } catch {
    return rejectWithValue('Network error');
  }
});

export const leaveAll = createAsyncThunk('games/leaveAll', async (_: void, { rejectWithValue }) => {
  try {
    await api.leaveAll();
  } catch {
    return rejectWithValue('Network error');
  }
});

export const startGame = createAsyncThunk('games/start', async (roomName: string, { rejectWithValue }) => {
  try {
    const res = await api.startGame(roomName);
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error);
    return data;
  } catch {
    return rejectWithValue('Network error');
  }
});

export const restartGame = createAsyncThunk('games/restart', async (roomName: string, { rejectWithValue }) => {
  try {
    const res = await api.restartGame(roomName);
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error);
    return data;
  } catch {
    return rejectWithValue('Network error');
  }
});

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
