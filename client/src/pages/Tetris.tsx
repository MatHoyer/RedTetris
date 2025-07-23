import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Events, type TTetromino } from '../../../events';
import { Board } from '../components/Board';
import { Button } from '../components/Button';
import { EmptyCell } from '../globals';
import { updateBoard, type RootState } from '../redux';
import socket from '../socket';
import { NotFound } from './NotFound';

export const Tetris = () => {
  const [score, setScore] = useState(0);
  const nav = useParams();
  const user = useSelector((state: RootState) => state.user);
  const gamesList = useSelector((state: RootState) => state.gamesList);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on(Events.UPDATED_BOARD, ({ board }: { board: (TTetromino | 'empty')[][] }) => {
      const arr = board.map((row) => row.map((cell) => cell ?? EmptyCell));

      dispatch(updateBoard(arr));
    });

    return () => {
      socket.off(Events.UPDATED_BOARD);
    };
  }, []);

  if (!nav.roomId) return <NotFound />;

  const goodGame = gamesList.find((game) => game.id === +nav.roomId!);
  if (!goodGame) return <NotFound />;

  const players = goodGame.players;
  if (players.length === 0 || players.every((player) => player.id !== user.id)) {
    return <NotFound />;
  }

  return (
    <div className="app">
      <h1 className="text-4xl font-bold text-center text-blue-500 py-2">TETRIS</h1>
      <Board />
      <div className="controls">
        <h2>Score: {score}</h2>
        <Link to="/" onClick={() => socket.emit(Events.LEAVE_GAMES)}>
          <Button>Quit</Button>
        </Link>
      </div>
    </div>
  );
};
