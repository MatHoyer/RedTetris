import { Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { CreateGame } from './CreateGame';
import { Home } from './Home';
import { Lobby } from './Lobby';
import { LoginHub } from './LoginHub';
import { NotFound } from './NotFound';
import { Online } from './Online';
import { Settings } from './Settings';
import { Tetris } from './Tetris';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const user = useSelector((state) => state.user);

  if (user.name === '') {
    return <Navigate to="/login-hub"></Navigate>;
  }
  return <Outlet />;
};

/**
 * Get the right page from hash
 *
 * @returns {JSX.Element} - The page requested
 */
export const Pages = () => {
  return (
    <Routes>
      <Route path="/login-hub" element={<LoginHub />} />
      <Route path="*" element={<NotFound />} />
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/solo" element={<Tetris />} />
        <Route path="/online" element={<Online />} />
        <Route path="/create-game" element={<CreateGame />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/:roomId/:playerName" element={<Lobby />} />
      </Route>
    </Routes>
  );
  // const nav = useSelector((state) => state.nav)

  // if (user.name === '') return <LoginHub />
  // if (nav.hash === 'home') return <Home />
  // if (nav.hash === 'settings') return <Settings />
  // if (nav.hash === 'solo') return <Tetris />
  // if (nav.hash === 'online') return <Online />
  // if (nav.hash === 'create-game') return <CreateGame />
  // if (nav.hash === 'lobby' || nav.param === user.name) return <Lobby />
  // return <NotFound page={nav.hash + `[${nav.param}]`} />
};
