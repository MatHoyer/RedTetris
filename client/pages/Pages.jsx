import { useHashNavigation } from '../hooks/useHashNavigation'
import { CreateGame } from './CreateGame'
import { Home } from './Home'
import { Lobby } from './Lobby'
import { LoginHub } from './LoginHub'
import { NotFound } from './NotFound'
import { Online } from './Online'
import { Settings } from './Settings'
import { Tetris } from './Tetris'
import { useSelector } from 'react-redux'

/**
 * Get the right page from hash
 *
 * @returns {JSX.Element} - The page requested
 */
export const Pages = () => {
  const user = useSelector((state) => state.user)
  const { page, param } = useHashNavigation()
  if (user.name === '') return <LoginHub />
  if (page === 'home') return <Home />
  if (page === 'settings') return <Settings />
  if (page === 'solo') return <Tetris />
  if (page === 'online') return <Online />
  if (page === 'create-game') return <CreateGame />
  if (page === 'lobby') return <Lobby />
  return <NotFound page={page} />
}
