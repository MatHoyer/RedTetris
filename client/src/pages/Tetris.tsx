import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Events } from '../../../events';
import { Board } from '../components/Board';
import { Button } from '../components/Button';
import Cell from '../components/Cell';
import { EmptyCell, type TCell } from '../globals';
import { leaveAll, resetBoard, resetGame, type AppDispatch, type RootState } from '../redux';
import socket from '../socket';
import { NotFound } from './NotFound';

export const Tetris = () => {
  const nav = useParams();
  const user = useSelector((state: RootState) => state.user);
  const gamesList = useSelector((state: RootState) => state.gamesList);
  const score = useSelector((state: RootState) => state.game.score);
  const level = useSelector((state: RootState) => state.game.level);
  const nextPiece = useSelector((state: RootState) => state.game.nextPiece);
  const status = useSelector((state: RootState) => state.game.status);
  const otherPlayersData = useSelector((state: RootState) => state.game.otherPlayersData);
  const spectrums = useSelector((state: RootState) => state.game.spectrums);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.key) {
        case 'ArrowDown':
          socket.emit(Events.KEY_DOWN_PRESS);
          break;
        case 'ArrowLeft':
          socket.emit(Events.KEY_LEFT_PRESS);
          break;
        case 'ArrowRight':
          socket.emit(Events.KEY_RIGHT_PRESS);
          break;
        case 'ArrowUp':
          socket.emit(Events.KEY_ROTATE_PRESS);
          break;
        case ' ':
          socket.emit(Events.KEY_HARD_DROP);
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          socket.emit(Events.KEY_DOWN_RELEASE);
          break;
        case 'ArrowLeft':
          socket.emit(Events.KEY_LEFT_RELEASE);
          break;
        case 'ArrowRight':
          socket.emit(Events.KEY_RIGHT_RELEASE);
          break;
        case 'ArrowUp':
          socket.emit(Events.KEY_ROTATE_RELEASE);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      dispatch(resetBoard());
      dispatch(resetGame());
    };
  }, []);

  useEffect(() => {
    if (!status) return;
    const redirectTimeout = setTimeout(() => {
      navigate('/');
    }, 5000);
    return () => {
      clearTimeout(redirectTimeout);
      dispatch(leaveAll());
    };
  }, [status]);

  if (!nav.roomId) return <NotFound />;

  const goodGame = gamesList.find((game) => game.id === nav.roomId!);
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
        <h3>Level: {level}</h3>
        <div>
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div className="row" key={`${rowIndex}`}>
              {Array.from({ length: 4 }).map((_, colIndex) => {
                if (
                  nextPiece.nextPieceShape.length > rowIndex &&
                  nextPiece.nextPieceShape[rowIndex].length > colIndex
                ) {
                  return (
                    <Cell
                      key={`${rowIndex}-${colIndex}`}
                      type={
                        nextPiece.nextPieceShape[rowIndex][colIndex] === 1 ? (nextPiece.nextPiece as TCell) : EmptyCell
                      }
                    />
                  );
                }
                return <Cell key={`${rowIndex}-${colIndex}`} type={EmptyCell} />;
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {otherPlayersData.map((player) => (
            <div
              key={player.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                marginLeft: '10px',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div>{player.name}</div>
                <div style={{ color: player.alive ? 'lightgreen' : 'red', fontSize: '0.8em' }}>
                  {player.alive ? 'Alive' : 'Dead'}
                </div>
                <div style={{ fontSize: '0.8em' }}>{player.score}</div>
              </div>
              {spectrums[player.id] && (
                <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '80px' }}>
                  {spectrums[player.id].map((height, col) => (
                    <div
                      key={col}
                      style={{
                        width: '6px',
                        height: `${(height / 20) * 100}%`,
                        backgroundColor: player.alive ? 'var(--primary-color)' : 'grey',
                        minHeight: height > 0 ? '1px' : '0',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <Link to="/" onClick={() => dispatch(leaveAll())}>
          <Button>Quit</Button>
        </Link>
      </div>
      {!!status && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '2rem',
            backgroundColor: 'black',
            color: status === 'win' ? 'green' : 'red',
            padding: '10px',
            borderRadius: '10px',
          }}
        >
          You {status === 'win' ? 'won' : 'lost'}
        </div>
      )}
    </div>
  );
};
