import { useEffect, useState } from 'react';
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
  const [autoJoinDone, setAutoJoinDone] = useState(false);
  const [gamesListLoaded, setGamesListLoaded] = useState(false);
  const needsAutoJoin = !user.name && !!nav.playerName;

  const leaveRoom = () => {
    socket.emit(Events.LEAVE_GAMES);
  };

  useEffect(() => {
    window.addEventListener('beforeunload', leaveRoom);

    return () => {
      window.removeEventListener('beforeunload', leaveRoom);
    };
  }, []);

  useEffect(() => {
    if (autoJoinDone || !needsAutoJoin || !nav.roomId || !nav.playerName) return;

    socket.emit(Events.UPDATE_PLAYER, { name: nav.playerName });
    setAutoJoinDone(true);
  }, [needsAutoJoin, autoJoinDone, nav.roomId, nav.playerName]);

  useEffect(() => {
    if (!autoJoinDone || !user.name) return;

    const handler = () => setGamesListLoaded(true);
    socket.on(Events.UPDATED_GAME_LIST, handler);
    socket.emit(Events.UPDATE_GAMES_LIST);

    return () => {
      socket.off(Events.UPDATED_GAME_LIST, handler);
    };
  }, [autoJoinDone, user.name]);

  useEffect(() => {
    if (!autoJoinDone || !gamesListLoaded || !nav.roomId || !user.name) return;

    const isInGame = gamesList.some(
      (game) => game.id === nav.roomId && game.players.some((p) => p.id === user.id),
    );
    if (isInGame) return;

    const existingGame = gamesList.find((game) => game.id === nav.roomId);
    if (existingGame) {
      socket.emit(Events.JOIN_GAME, { roomName: nav.roomId });
    } else {
      socket.emit(Events.NEW_GAME, { roomName: nav.roomId, maxPlayers: 8 });
    }
  }, [autoJoinDone, gamesListLoaded, user.name, user.id, nav.roomId, gamesList]);

  if (!nav.roomId) return <NotFound />;

  if (needsAutoJoin || (autoJoinDone && !gamesList.some((g) => g.id === nav.roomId && g.players.some((p) => p.id === user.id)))) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Joining...</div>;
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
        {user.id === goodGame.admin.id && (
          <Button onClick={() => socket.emit(Events.GAME_START, { roomName: goodGame.id })}>Start</Button>
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
