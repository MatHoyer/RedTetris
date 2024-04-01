/**
 * Cell takes a type of tetris block and return a div with the good className
 *
 * @param {Block | EmptyCell} type - type is for the color of the block
 * @returns {JSX.Element} - a cell of the grid
 */
export const Cell = ({ type }) => {
    return <div className={`cell ${type}`} />;
};

export default Cell;
