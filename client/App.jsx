import { Navbar } from './components/NavBar'
import { Pages } from './pages/Pages'
import { useDispatch } from 'react-redux'
import { updateGamesList } from './redux'
import { useEffect } from 'react'

import socket from './socket'
import { events } from '../events/index.js'

const App = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    socket.on(events.GAME_CREATED, (game) => {
      location.hash = game.id
    })
    socket.on(events.UPDATE_GAMES_LIST, (games) => {
      const cleanedGames = games.map((game) => {
        const { createdAt, id, ...gameCleanup } = game
        return gameCleanup
      })
      dispatch(updateGamesList(cleanedGames))
    })

    return () => {
      socket.off(events.GAME_CREATED)
      socket.off(events.UPDATE_GAMES_LIST)
    }
  }, [])

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
