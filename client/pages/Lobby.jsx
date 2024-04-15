import { Button } from '../components/Button'
import { Table } from '../components/Table'
import { useSelector } from 'react-redux'
import { NotFound } from './NotFound'
import { useParams } from 'react-router-dom'

export const Lobby = () => {
  const nav = useParams()
  const user = useSelector((state) => state.user)
  const gamesList = useSelector((state) => state.gamesList)
  const goodGame = gamesList.find((game) => game.id === nav.roomId) || {
    players: [],
  }
  const players = goodGame.players

  if (players.length === 0 || players.every((player) => player !== user.name)) {
    return <NotFound page={`/${nav.roomId}/${nav.playerName}`} />
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
  return <div></div>
}
