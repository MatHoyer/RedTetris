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
                }}
                className="background-image"
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '10%',
                        flexDirection: 'column',
                    }}
                >
                    <img src="RedTetris-logo.png" alt="Title" />
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Button style={{ zIndex: 2 }} onClick={() => (location.hash = 'solo')}>
                            Solo
                        </Button>
                        <Button style={{ zIndex: 2 }} onClick={() => (location.hash = 'online')}>
                            Online
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
