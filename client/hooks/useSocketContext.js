import { useContext } from 'react'
import { SocketContext } from '../providers/SocketProvider.jsx'

/**
 * @typedef {import('socket.io-client').Socket} Socket
 */

/**
 * @typedef {Object} SocketContextType
 * @property {Socket} socket
 * @property {(socket: Socket) => void} setSocket
 */

/**
 * @returns {SocketContextType}
 */
export function useSocketContext() {
  const { socket, setSocket } = useContext(SocketContext)

  return { socket, setSocket }
}
