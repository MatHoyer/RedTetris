import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { Button } from './Button'
import { Settings } from '../pages/Settings'

const NavLink = ({ ...props }) => {
  return (
    <a
      className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4"
      {...props}
    ></a>
  )
}

/**
 * Create a navigation bar
 *
 * @returns {JSX.Element}
 */
export const Navbar = () => {
  const [openSettings, setOpenSettings] = useState(false)

  const handleClick = () => setOpenSettings(true)

  const handleClose = () => setOpenSettings(false)

  return (
    <nav>
      <a href="#home">
        <img
          src="/client/assets/RedTetris-logo.png"
          alt="logo"
          style={{ width: '100px', margin: '10px' }}
        />
      </a>
      <FontAwesomeIcon
        style={{ position: 'absolute', top: '10px', right: '10px' }}
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
  )
}
