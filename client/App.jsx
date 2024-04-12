import { Navbar } from './components/NavBar'
import { Pages } from './pages/Pages'
import { Provider } from 'react-redux'
import { store } from './redux'
import { useEffect } from 'react'

import socket from './socket'
import { events } from '../events/index.js'

const App = () => {
  useEffect(() => {
    socket.on(events.GAME_CREATED, (game) => {
      location.hash = game.id
    })
    socket.on(events.UPDATE_GAMES_LIST, (games) => {
      console.log(games)
    })

    return () => {
      socket.off(events.GAME_CREATED)
    }
  }, [])

  return (
    <Provider store={store}>
      <div>
        <Navbar />
        <div style={{ height: 'calc(100vh - 65px)' }}>
          <Pages />
        </div>
      </div>
    </Provider>
  )
}

export default App
