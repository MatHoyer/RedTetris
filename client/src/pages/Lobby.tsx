import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { useSelector } from 'react-redux';
import { NotFound } from './NotFound';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

import socket from '../socket';
// import { Events } from '../../../events/index';

export const Lobby = () => {
  const nav = useParams();
  const user = useSelector((state) => state.user);
  const gamesList = useSelector((state) => state.gamesList);
  const location = useLocation();
  const navigate = useNavigate();

  const goodGame = gamesList.find((game) => game.id === nav.roomId) || {
    players: [],
  };
  const players = goodGame.players;

  useEffect(() => {
    const leaveRoom = () => {
      // socket.emit(Events.LEAVE_GAME, nav.roomId);
    };

    const handleBeforeUnload = (event) => {
      leaveRoom();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      leaveRoom();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname]);

  if (players.length === 0 || players.every((player) => player !== user.name)) {
    return <NotFound />;
  }

  const playersForTab = players.map((player) => ({
    name: player,
    status: goodGame.owner === player ? 'owner' : '',
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
        {user.name === goodGame.owner && <Button>Start</Button>}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div className="scrollable-div" style={{ maxHeight: '65%', overflowY: 'auto' }}>
          <Table linesObj={playersForTab} />
        </div>
      </div>
    </>
  );
  return <div></div>;
};
