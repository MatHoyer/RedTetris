import Cell from './Cell';

/**
 * Create the board div
 *
 * @param {string[][]} currentBoard - the board
 * @returns {JSX.Element} - return a div with all the cell of the board
 */
export const Board = ({ currentBoard }) => {
    return (
        <div className="board">
            {currentBoard.map((row, rowIndex) => (
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
