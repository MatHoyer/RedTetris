import React from 'react'
import { io } from 'socket.io-client'

export const SocketContext = React.createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = React.useState(
    io({
      autoConnect: true,
    })
  )

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  )
}
