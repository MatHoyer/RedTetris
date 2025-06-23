import { useEffect } from 'react';
import { Navbar } from './components/NavBar';
import { Pages } from './pages/Pages';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Events } from '../../events';
import { changeId } from './redux';
import socket from './socket';

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on(Events.PLAYER_UPDATED, ({ id, name: _ }: { id: string; name: string }) => {
      dispatch(changeId(id));
      if (id) navigate('/', { replace: true });
    });

    return () => {
      socket.off(Events.PLAYER_UPDATED);
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
