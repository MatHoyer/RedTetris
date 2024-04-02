import { useHashNavigation } from '../hooks/useHashNavigation';
import { CreateGame } from './CreateGame';
import { Home } from './Home';
import { NotFound } from './NotFound';
import { Online } from './Online';
import { Solo } from './Solo';
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
    if (page === 'solo') return <Solo />;
    if (page === 'online') return <Online />;
    if (page === 'create-game') return <CreateGame />;
    if (page === 'tetris') return <Tetris />;
    return <NotFound page={page} />;
};
