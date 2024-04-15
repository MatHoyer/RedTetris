import { useState } from 'react'
import { Button } from '../components/Button'
import { InputText } from '../components/Inputs'
import socket from '../socket'
import events from '../../events/index.js'
import { Link } from 'react-router-dom'

/**
 *
 * @returns {JSX.Element}
 */
export const LoginHub = () => {
  const [text, setText] = useState('')

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10%',
          flexDirection: 'column',
        }}
      >
        <img src="/client/assets/RedTetris-logo.png" alt="Title" />
        <div style={{ display: 'flex', gap: '20px' }}>
          <InputText
            id="nameSelect"
            onChange={(e) => setText(e.target.value)}
            label="Select you're username"
            value={text}
          />
          <Link to="/login">
            <Button>Login</Button>
          </Link>
          <Link to="/">
            <Button
              onClick={() => {
                socket.emit(events.PLAYER_UPDATED, text)
              }}
            >
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
