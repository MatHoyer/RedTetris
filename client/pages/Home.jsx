import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

/**
 * Home page
 *
 * @returns {JSX.Element}
 */
export const Home = () => {
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
        <img src="/client/assets/RedTetris-logo.png" alt="Title" />
        <div style={{ display: 'flex', gap: '20px', zIndex: 2 }}>
          <Link to="/solo">
            <Button>Solo</Button>
          </Link>
          <Link to="/online">
            <Button>Online</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
