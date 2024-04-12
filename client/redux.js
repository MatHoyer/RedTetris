import { configureStore, createSlice } from '@reduxjs/toolkit'
import { io } from 'socket.io-client'

// ================User================
const userSlice = createSlice({
  name: 'user',
  initialState: {
    name: '',
  },
  reducers: {
    changeName: (state, action) => {
      //{ type: 'user/changeName', payload: string }
      state.name = action.payload
    },
  },
})

export const { changeName } = userSlice.actions

// ================GameList================
const gameListSlice = createSlice({
  name: 'gameList',
  initialState: [],
  reducers: {
    updateGameList: (state, action) => {
      //{ type: 'gameList/updateGameList', payload: Game[] }
      state = action.payload
    },
  },
})

export const { updateGameList } = gameListSlice.actions

// ================Board================
const createBoard = () => {
  const returnArray = Array(20)
    .fill(null)
    .map(() => Array(10).fill(0))

  returnArray[1][1] = 1
  returnArray[1][2] = 1
  returnArray[1][3] = 1

  return returnArray
}

const boardSlice = createSlice({
  name: 'board',
  initialState: createBoard(),
  reducers: {
    updateBoard: (state, action) => {
      //{ type: 'board/updateBoard', payload: int[][] }
      state = action.payload
    },
  },
})

export const { updateBoard } = boardSlice.actions

// ================Store================
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    board: boardSlice.reducer,
  },
})
