import { Home } from './Home';
import { NotFound } from './NotFound';
import { Online } from './Online';
import { Solo } from './Solo';
import { Tetris } from './Tetris';

/**
 * Get the right page from hash
 *
 * @param {page} string - Hash data
 * @returns {JSX.Element} - The page requested
 */
export const Pages = ({ page }) => {
    console.log(page);
    if (page === 'home') return <Home />;
    if (page === 'solo') return <Solo />;
    if (page === 'online') return <Online />;
    if (page === 'tetris') return <Tetris />;
    return <NotFound page={page} />;
};
