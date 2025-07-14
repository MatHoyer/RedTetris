import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Events } from '../../../events';
import { Button } from '../components/Button';
import { Table, TableCell, TableLine } from '../components/Table';
import type { RootState } from '../redux';
import socket from '../socket';
import { NotFound } from './NotFound';

export const Lobby = () => {
  const nav = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const gamesList = useSelector((state: RootState) => state.gamesList);

  const leaveRoom = () => {
    socket.emit(Events.LEAVE_GAMES);
  };

  useEffect(() => {
    window.addEventListener('beforeunload', leaveRoom);

    return () => {
      window.removeEventListener('beforeunload', leaveRoom);
    };
  }, []);

  if (!nav.roomId) return <NotFound />;

  const goodGame = gamesList.find((game) => game.id === +nav.roomId!);
  if (!goodGame) return <NotFound />;

  const players = goodGame.players;
  if (players.length === 0 || players.every((player) => player.id !== user.id)) {
    return <NotFound />;
  }

  const playersForTab = players.map((player) => ({
    ...player,
    status: goodGame.admin.id === player.id ? 'owner' : '',
  }));

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {user.id === goodGame.admin.id && (
          <Button onClick={() => socket.emit(Events.GAME_START, { gameId: goodGame.id })}>Start</Button>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div className="scrollable-div" style={{ maxHeight: '65%', overflowY: 'auto' }}>
          <Table header={['Name', 'Status']}>
            {playersForTab.map((player) => (
              <TableLine key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.status}</TableCell>
              </TableLine>
            ))}
          </Table>
        </div>
        <Button
          onClick={() => {
            leaveRoom();
            navigate('/online');
          }}
        >
          Quit
        </Button>
      </div>
    </>
  );
};
