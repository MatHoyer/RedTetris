import { Button } from '../components/Button'
import { Table } from '../components/Table'
import { useSelector } from 'react-redux'
import { NotFound } from './NotFound'

export const Lobby = () => {
  const user = useSelector((state) => state.user)
  const gamesList = useSelector((state) => state.gamesList)
  const nav = useSelector((state) => state.nav)
  const goodGame = gamesList.find((game) => game.id === nav.hash) || {
    players: [],
  }
  const players = goodGame.players

  if (players.length === 0 || players.every((player) => player !== user.name)) {
    return <NotFound page={nav.hash + `[${nav.param}]`} />
  }
  const playersForTab = players.map((player) => ({
    name: player,
    status: goodGame.owner === player ? 'owner' : '',
  }))

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {user.name === goodGame.owner && <Button>Start</Button>}
      </div>
      <div
        className="scrollable-div"
        style={{ maxHeight: '65%', overflowY: 'auto' }}
      >
        <Table linesObj={playersForTab} />
      </div>
    </>
  )
}
