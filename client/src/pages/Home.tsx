import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { AppLoader } from '../components/Loader';
import { createGame, type AppDispatch, type RootState } from '../redux';

export const Home = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSolo = async () => {
    setIsLoading(true);
    const roomName = `solo-${user.name}`;
    const result = await dispatch(createGame({ roomName, maxPlayers: 1 }));
    if (createGame.fulfilled.match(result)) {
      navigate(`/${roomName}/${user.name}`);
    }
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
