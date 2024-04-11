import { useState } from 'react'
import { Button } from '../components/Button'
import { InputText } from '../components/Inputs'
import { useDispatch, useSelector } from 'react-redux'

/**
 *
 * @returns {JSX.Element}
 */
export const LoginHub = () => {
  const [text, setText] = useState('')
  const user = useSelector((state) => state.user)

  const dispatch = useDispatch()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
      className="background-image"
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
        <div style={{ display: 'flex', gap: '20px', zIndex: 2 }}>
          <InputText
            id="nameSelect"
            onChange={(e) => setText(e.target.value)}
            label="Select you're username"
            value={text}
          />
          <Button onClick={() => (location.hash = 'login')}>Login</Button>
          <Button
            onClick={() => {
              dispatch({
                type: 'user/changeName',
                payload: { name: text },
              })
              location.hash = 'home'
            }}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  )
}
