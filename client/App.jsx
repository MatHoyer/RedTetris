import { Navbar } from './components/NavBar'
import { Pages } from './pages/Pages'
import { useDispatch, useSelector } from 'react-redux'
import { changeName, updateGamesList } from './redux'
import { useEffect, useState } from 'react'

import socket from './socket'
import { events } from '../events/index.js'
import { Text } from './components/Text.jsx'
import { useNavigate } from 'react-router-dom'

const App = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    const gameCreatedIo = (game) => {
      navigate(`/${game.id}/${user.name}`)
    }

    const updateGamesListIo = (games) => {
      const cleanedGames = games.map((game) => {
        const { createdAt, ...gameCleanup } = game
        return gameCleanup
      })
      dispatch(updateGamesList(cleanedGames))
    }

    const updatePlayer = (playerName) => {
      dispatch(changeName(playerName))
    }

    socket.on(events.GAME_CREATED, gameCreatedIo)
    socket.on(events.UPDATE_GAMES_LIST, updateGamesListIo)
    socket.on(events.PLAYER_UPDATED, updatePlayer)
    socket.on(events.JOIN_GAME, gameCreatedIo)

    return () => {
      socket.off(events.GAME_CREATED)
      socket.off(events.UPDATE_GAMES_LIST)
      socket.off(events.PLAYER_UPDATED)
      socket.off(events.JOIN_GAME)
      socket.off(events.JOIN_GAME_FAILED)
    }
  }, [user])

  return (
    <div>
      <Navbar />
      <div style={{ height: 'calc(100vh - 65px)' }}>
        <Pages />
      </div>
    </div>
  )
}

export default App
