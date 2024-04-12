import { Navbar } from './components/NavBar'
import { Pages } from './pages/Pages'
import { io } from 'socket.io-client'
import { Provider } from 'react-redux'
import { store } from './redux'

const App = () => {
  const socketio = io()
  console.log('socketio', socketio)
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
