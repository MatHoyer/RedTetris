import { useEffect } from 'react';
import { Navbar } from './components/NavBar';
import { Pages } from './pages/Pages';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Events } from '../../events';
import { changeId, changeName, updateGamesList, type RootState } from './redux';
import socket from './socket';

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    socket.on(Events.PLAYER_UPDATED, ({ id, name }: { id: string; name: string }) => {
      dispatch(changeId(id));
      dispatch(changeName(name));
      if (id) navigate('/', { replace: true });
    });

    socket.on(Events.UPDATED_GAME_LIST, ({ sessions }) => {
      dispatch(updateGamesList(sessions));
    });

    socket.on(Events.GAME_CREATED, ({ gameId }: { gameId: number }) => {
      navigate(`/${gameId}/${user.id}`);
    });

    socket.on(Events.GAME_JOINED, ({ gameId }: { gameId: number }) => {
      navigate(`/${gameId}/${user.id}`);
    });

    return () => {
      socket.off(Events.PLAYER_UPDATED);
      socket.off(Events.UPDATED_GAME_LIST);
      socket.off(Events.GAME_CREATED);
      socket.off(Events.GAME_JOINED);
    };
  }, []);

  return (
    <div>
      <div className="background-image" />
      <div>
        <Navbar />
        <div style={{ height: 'calc(100vh - 65px)' }}>
          <Pages />
        </div>
      </div>
    </div>
  );
};

export default App;
