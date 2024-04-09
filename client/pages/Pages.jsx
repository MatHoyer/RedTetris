import { useHashNavigation } from '../hooks/useHashNavigation';
import { CreateGame } from './CreateGame';
import { Home } from './Home';
import { Login, Register, LoginHub } from './LoginHub';
import { NotFound } from './NotFound';
import { Online } from './Online';
import { Settings } from './Settings';
import { Tetris } from './Tetris';

/**
 * Get the right page from hash
 *
 * @returns {JSX.Element} - The page requested
 */
export const Pages = ({ registered, setRegistered }) => {
    const { page, param } = useHashNavigation();
    console.log(page);
    // if (!registered) {
    //     if (page === 'login') return <Login setRegistered={setRegistered} />;
    //     if (page === 'register') return <Register setRegistered={setRegistered} />;
    //     return <LoginHub />;
    // }
    if (page === 'home') return <Home />;
    if (page === 'settings') return <Settings />;
    if (page === 'solo') return <Tetris />;
    if (page === 'online') return <Online />;
    if (page === 'create-game') return <CreateGame />;
    return <NotFound page={page} />;
};
