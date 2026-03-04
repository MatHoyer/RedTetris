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
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on(Events.PLAYER_UPDATED, ({ id, name }: { id: string; name: string }) => {
      console.log('PLAYER_UPDATED', id, name);
      dispatch(changeId(id));
      dispatch(changeName(name));
      if (id) navigate('/', { replace: true });
    });

    socket.on(Events.UPDATED_GAME_LIST, ({ sessions }) => {
      console.log('UPDATED_GAME_LIST', sessions);
      dispatch(updateGamesList(sessions));
    });

    socket.on(Events.GAME_CREATED, ({ roomName }: { roomName: string }) => {
      console.log('GAME_CREATED', roomName);
      navigate(`/${roomName}/${user.name}`);
    });

    socket.on(Events.GAME_JOINED, ({ roomName }: { roomName: string }) => {
      console.log('GAME_JOINED', roomName);
      navigate(`/${roomName}/${user.name}`);
    });

    socket.on(Events.GAME_STARTED, ({ roomName }: { roomName: string }) => {
      console.log('GAME_STARTED', roomName);
      navigate(`/${roomName}/${user.name}/game`);
    });

    return () => {
      socket.off(Events.PLAYER_UPDATED);
      socket.off(Events.UPDATED_GAME_LIST);
      socket.off(Events.GAME_CREATED);
      socket.off(Events.GAME_JOINED);
      socket.off(Events.GAME_STARTED);
    };
  }, [user.name]);

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
