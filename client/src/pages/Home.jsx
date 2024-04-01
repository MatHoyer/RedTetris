import { Button } from '../components/Button';

/**
 * Home page
 *
 * @returns {JSX.Element}
 */
export const Home = () => {
    return (
        <>
            <Button onClick={() => (location.hash = 'solo')}>Solo</Button>
            <Button onClick={() => (location.hash = 'online')}>Online</Button>
        </>
    );
};
