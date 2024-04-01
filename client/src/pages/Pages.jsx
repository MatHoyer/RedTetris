import { Home } from './Home';
import { NotFound } from './NotFound';
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
    if (page === 'tetris') return <Tetris />;
    return <NotFound page={page} />;
};
