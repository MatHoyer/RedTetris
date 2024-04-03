import { Button } from '../components/Button';

export const Register = ({ setRegistered }) => {
    return <h1>register</h1>;
};

export const Login = ({ setRegistered }) => {
    return <h1>login</h1>;
};

/**
 *
 * @returns {JSX.Element}
 */
export const LoginHub = () => {
    return (
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
                    <Button style={{ zIndex: 2 }} onClick={() => (location.hash = 'login')}>
                        Login
                    </Button>
                    <Button style={{ zIndex: 2 }} onClick={() => (location.hash = 'register')}>
                        Register
                    </Button>
                </div>
            </div>
        </div>
    );
};
