import { useState } from 'react'
import { Board } from '../components/Board'
import { EmptyCell } from '../globals'
import { Button } from '../components/Button'
import { Link } from 'react-router-dom'
// import events from '../../events/index.js'
// import { createGame } from '../events/index.js'

const createBoard = () => {
  const returnArray = Array(20)
    .fill(null)
    .map(() => Array(10).fill(EmptyCell))

  returnArray[1][1] = 'cell J'
  returnArray[1][2] = 'cell J'
  returnArray[1][3] = 'cell J'

  return returnArray
}

/**
 * Page for the tetris game
 *
 * @param {}
 * @returns {JSX.Element} - Tetris game
 */
export const Tetris = () => {
  const [score, setScore] = useState(0)

  // const { socket } = useSocketContext()
  // socket.emit(events.NEW_GAME, createGame(''))

  return (
    <div className="app">
      <h1 className="text-4xl font-bold text-center text-blue-500 py-2">
        TETRIS
      </h1>
      <Board />
      <div className="controls">
        <h2>Score: {score}</h2>
        <Link to="/">
          <Button>Quit</Button>
        </Link>
      </div>
    </div>
  )
}
