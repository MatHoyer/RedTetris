import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from './components/NavBar';
import { Pages } from './pages/Pages';
import { changeName, updateGamesList } from './redux';

import { useNavigate } from 'react-router-dom';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const gameCreatedIo = (game) => {
      navigate(`/${game.id}/${user.name}`);
    };

    const updateGamesListIo = (games) => {
      const cleanedGames = games.map((game) => {
        const { createdAt, ...gameCleanup } = game;
        return gameCleanup;
      });
      dispatch(updateGamesList(cleanedGames));
    };

    const updatePlayer = (playerName) => {
      if (playerName !== 'error') {
        dispatch(changeName(playerName));
        navigate('/');
      } else {
        alert('Name already taken, please choose another one.');
      }
    };

    // socket.on(Events.GAME_CREATED, gameCreatedIo);
    // socket.on(Events.UPDATE_GAMES_LIST, updateGamesListIo);
    // socket.on(Events.PLAYER_UPDATED, updatePlayer);
    // socket.on(Events.JOIN_GAME, gameCreatedIo);

    return () => {
      // socket.off(Events.GAME_CREATED);
      // socket.off(Events.UPDATE_GAMES_LIST);
      // socket.off(Events.PLAYER_UPDATED);
      // socket.off(Events.JOIN_GAME);
    };
  }, [user]);

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
