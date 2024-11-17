import Cell from './Cell'
import { useSelector } from 'react-redux'

/**
 * Create the board div
 *
 * @param {string[][]} currentBoard - the board
 * @returns {JSX.Element} - return a div with all the cell of the board
 */
export const Board = () => {
  const board = useSelector((state) => state.board)

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div className="row" key={`${rowIndex}`}>
          {row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} type={'c' + cell} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board
