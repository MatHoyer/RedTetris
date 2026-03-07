import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import socket from '../socket';
import { Table, TableCell, TableLine } from '../components/Table';
import { createGame, joinGame, leaveAll, startGame, updatePlayer, type AppDispatch, type RootState } from '../redux';
import { NotFound } from './NotFound';

export const Lobby = () => {
  const nav = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const gamesList = useSelector((state: RootState) => state.gamesList);
  const needsAutoJoin = !user.name && !!nav.playerName;
  const joiningRef = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const socketId = socket.id ?? '';
      const blob = new Blob([JSON.stringify({ socketId })], { type: 'application/json' });
      navigator.sendBeacon('/api/games/leave-all', blob);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!needsAutoJoin || !nav.playerName) return;
    dispatch(updatePlayer(nav.playerName));
  }, [needsAutoJoin, nav.playerName]);

  useEffect(() => {
    if (!user.name || !nav.roomId || joiningRef.current) return;

    const isInGame = gamesList.some((game) => game.id === nav.roomId && game.players.some((p) => p.id === user.id));
    if (isInGame) return;

    joiningRef.current = true;
    const existingGame = gamesList.find((game) => game.id === nav.roomId);
    if (existingGame) {
      dispatch(joinGame(nav.roomId)).finally(() => {
        joiningRef.current = false;
      });
    } else {
      dispatch(createGame({ roomName: nav.roomId, maxPlayers: 8 })).finally(() => {
        joiningRef.current = false;
      });
    }
  }, [user.name, user.id, nav.roomId, gamesList]);

  if (!nav.roomId) return <NotFound />;

  if (needsAutoJoin || !gamesList.some((g) => g.id === nav.roomId && g.players.some((p) => p.id === user.id))) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Joining...</div>
    );
  }

  const goodGame = gamesList.find((game) => game.id === nav.roomId!);
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
        {user.id === goodGame.admin.id && <Button onClick={() => dispatch(startGame(goodGame.id))}>Start</Button>}
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
            dispatch(leaveAll());
            navigate('/online');
          }}
        >
          Quit
        </Button>
      </div>
    </>
  );
};
