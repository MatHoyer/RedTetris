import { useState } from 'react'
import { Navbar } from './components/NavBar'
import { Pages } from './pages/Pages'
import { io } from 'socket.io-client'
import { Provider } from 'react-redux'
import { store } from './redux'

const App = () => {
  const [registered, setRegistered] = useState(false)
  const socketio = io()
  console.log('socketio', socketio)
  return (
    <Provider store={store}>
      <div>
        <Navbar />
        <div style={{ height: 'calc(100vh - 65px)' }}>
          <Pages registered={registered} setRegistered={setRegistered} />
        </div>
      </div>
    </Provider>
  )
}

export default App
