import { configureStore, createSlice } from '@reduxjs/toolkit'
import { io } from 'socket.io-client'

// ================Nav================
const navSlice = createSlice({
  name: 'nav',
  initialState: {
    hash: 'home',
    param: '',
  },
  reducers: {
    changeNav: (state, action) => {
      //{ type: 'nav/changeNav', payload: {hash: string, param: string} }
      state.hash = action.payload.hash
      state.param = action.payload.param
    },
  },
})

export const { changeNav } = navSlice.actions

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
const gamesListSlice = createSlice({
  name: 'gamesList',
  initialState: [],
  reducers: {
    updateGamesList: (state, action) => {
      //{ type: 'gamesList/updateGamesList', payload: Game[] }
      return action.payload
    },
  },
})

export const { updateGamesList } = gamesListSlice.actions

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
    nav: navSlice.reducer,
    user: userSlice.reducer,
    gamesList: gamesListSlice.reducer,
    board: boardSlice.reducer,
  },
})
