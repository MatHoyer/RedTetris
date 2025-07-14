import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Events } from '../../../events';
import { Settings } from '../pages/Settings';
import socket from '../socket';
import { Button } from './Button';

export const Navbar = () => {
  const [openSettings, setOpenSettings] = useState(false);

  const handleClick = () => setOpenSettings(true);

  const handleClose = () => setOpenSettings(false);

  return (
    <nav>
      <Link to="/" onClick={() => socket.emit(Events.LEAVE_GAMES)}>
        <img src="/assets/RedTetris-logo.png" alt="logo" style={{ width: '100px', margin: '10px' }} />
      </Link>
      <FontAwesomeIcon
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          cursor: 'pointer',
        }}
        icon={faCog}
        className="icon"
        onClick={handleClick}
      />
      {openSettings && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5,
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'black',
              padding: '20px',
              borderRadius: '10px',
              width: '160px',
              height: '350px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Settings />
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      )}
    </nav>
  );
};
