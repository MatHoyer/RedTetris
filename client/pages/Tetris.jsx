import { useState } from 'react'
import { Board } from '../components/Board'
import { EmptyCell } from '../globals'
import { Button } from '../components/Button'

/**
 * Page for the tetris game
 *
 * @param {}
 * @returns {JSX.Element} - Tetris game
 */
export const Tetris = () => {
  const [score, setScore] = useState(0)

  return (
    <div className="app">
      <h1 className="text-4xl font-bold text-center text-blue-500 py-2">
        TETRIS
      </h1>
      <Board />
      <div className="controls">
        <h2>Score: {score}</h2>
        <Button onClick={() => (location.hash = '#home')}>Quit</Button>
      </div>
    </div>
  )
}
