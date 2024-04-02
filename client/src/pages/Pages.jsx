import { useHashNavigation } from '../hooks/useHashNavigation';
import { CreateGame } from './CreateGame';
import { Home } from './Home';
import { NotFound } from './NotFound';
import { Online } from './Online';
import { Settings } from './Settings';
import { Tetris } from './Tetris';

/**
 * Get the right page from hash
 *
 * @returns {JSX.Element} - The page requested
 */
export const Pages = () => {
    const { page, param } = useHashNavigation();
    console.log(page);
    if (page === 'home') return <Home />;
    if (page === 'settings') return <Settings />;
    if (page === 'solo') return <Tetris />;
    if (page === 'online') return <Online />;
    if (page === 'create-game') return <CreateGame />;
    return <NotFound page={page} />;
};
