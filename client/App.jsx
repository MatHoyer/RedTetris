import { useState } from 'react'
import { Navbar } from './components/NavBar'
import { Pages } from './pages/Pages'
import { io } from 'socket.io-client'

const App = () => {
  const [registered, setRegistered] = useState(false)
  const socketio = io()
  console.log('socketio', socketio)
  return (
    <div>
      <Navbar />
      <div style={{ height: 'calc(100vh - 65px)' }}>
        <Pages registered={registered} setRegistered={setRegistered} />
      </div>
    </div>
  )
}

export default App
