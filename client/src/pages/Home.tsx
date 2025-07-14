import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Events } from '../../../events';
import { Button } from '../components/Button';
import { AppLoader } from '../components/Loader';
import socket from '../socket';

export const Home = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSolo = () => {
    setIsLoading(true);
    socket.emit(Events.NEW_GAME, { maxPlayers: 1 });
    setIsLoading(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10%',
          flexDirection: 'column',
        }}
      >
        <img src="/assets/RedTetris-logo.png" alt="Title" />
        <div style={{ display: 'flex', gap: '20px' }}>
          <Button onClick={handleCreateSolo}>{isLoading ? <AppLoader /> : 'Solo'}</Button>
          <Link to="/online">
            <Button>Online</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
