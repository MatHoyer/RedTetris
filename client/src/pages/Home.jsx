import { Button } from '../components/Button';

/**
 * Home page
 *
 * @returns {JSX.Element}
 */
export const Home = () => {
    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    gap: '20px',
                }}
            >
                <Button className="btn" onClick={() => (location.hash = 'solo')}>
                    Solo
                </Button>
                <Button className="btn" onClick={() => (location.hash = 'online')}>
                    Online
                </Button>
            </div>
        </>
    );
};
