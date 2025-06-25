import { useSelector } from 'react-redux';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import type { RootState } from '../redux';
import { CreateGame } from './CreateGame';
import { Home } from './Home';
import { Lobby } from './Lobby';
import { LoginHub } from './LoginHub';
import { NotFound } from './NotFound';
import { Online } from './Online';
import { Settings } from './Settings';
import { Tetris } from './Tetris';

const PrivateRoute = () => {
  const user = useSelector((state: RootState) => state.user);

  if (user.id === -1) {
    return <Navigate to="/login-hub" replace />;
  }
  return <Outlet />;
};

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
};
