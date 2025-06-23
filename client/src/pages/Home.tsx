import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const Home = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
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
        <img src="/assets/RedTetris-logo.png" alt="Title" />
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/solo">
            <Button>Solo</Button>
          </Link>
          <Link to="/online">
            <Button>Online</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
