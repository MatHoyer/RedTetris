import { Button } from '../components/Button'
import { Table } from '../components/Table'
import { useSelector } from 'react-redux'

export const Lobby = () => {
  const user = useSelector((state) => state.user)
  const players = [
    { name: 'player1', owner: true },
    { name: 'player2', owner: false },
    { name: 'player3', owner: false },
    { name: 'player4', owner: false },
  ]

  console.log(user.name)

  const playersForTab = players.map((player) => ({
    name: player.name,
    status: player.owner ? 'owner' : '',
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
        {user.name === 'player1' && <Button>Start</Button>}
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
