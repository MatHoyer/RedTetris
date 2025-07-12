import { useSelector } from 'react-redux';
import type { RootState } from '../redux';
import Cell from './Cell';

export const Board = () => {
  const board = useSelector((state: RootState) => state.board);

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div className="row" key={`${rowIndex}`}>
          {row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} type={cell} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
