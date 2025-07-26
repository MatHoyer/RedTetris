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
  const [keys, setKeys] = useState<Record<string, boolean>>({
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (['ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeys((prev) => ({
          ...prev,
          [e.key]: true,
        }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeys((prev) => ({
          ...prev,
          [e.key]: false,
        }));
      } else if (['ArrowUp', ' '].includes(e.key)) {
        socket.emit(e.key);
      }
    };

    socket.on(Events.UPDATED_BOARD, ({ board }: { board: (TTetromino | 'empty')[][] }) => {
      const arr = board.map((row) => row.map((cell) => cell ?? EmptyCell));

      dispatch(updateBoard(arr));
    });
    socket.on(Events.GAME_ENDED, ({ status }: { status: 'win' | 'loose' }) => {
      console.log(status);
    });

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      socket.off(Events.UPDATED_BOARD);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const emitKeys = () => {
      for (const [key, value] of Object.entries(keys)) {
        if (value) {
          socket.emit(key);
        }
      }
    };

    const interval = setInterval(emitKeys, 50);

    return () => {
      clearInterval(interval);
    };
  }, [keys]);

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
