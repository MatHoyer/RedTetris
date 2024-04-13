import { Button } from '../components/Button'
// import data from '../assets/data.json'
import { useEffect, useState } from 'react'
import { useToggle } from '../hooks/useToggle'
import { InputCheckbox, InputText } from '../components/Inputs'
import { Table } from '../components/Table'

import socket from '../socket'
import events from '../../events'
import { useSelector } from 'react-redux'

export const Online = () => {
  const { toggle: showInGame, setToggle: toggleShowInGame } = useToggle(true)
  const [research, setResearch] = useState('')
  const gamesList = useSelector((state) => state.gamesList)
  const user = useSelector((state) => state.user)

  useEffect(() => {
    socket.emit(events.UPDATE_GAMES_LIST)
  }, [])

  let filteredData = []
  if (gamesList) {
    filteredData = gamesList
      .filter((cell) => {
        if (
          research &&
          !cell.name.toLowerCase().includes(research.toLowerCase())
        )
          return false
        if (showInGame && cell.status) return false
        return true
      })
      .map((cell) => ({
        name: cell.name,
        maxPlayers: cell.maxPlayers,
        status: cell.status ? 'in game' : 'waiting...',
        join: (
          <Button
            disabled={cell.status}
            onClick={() => socket.emit(events.JOIN_GAME, cell.id)}
          >
            Join
          </Button>
        ),
      }))
  }

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <InputText
            id={research}
            label="research: "
            onChange={(e) => setResearch(e.target.value)}
            value={research}
          />
        </div>
        <InputCheckbox
          id="gameCheck"
          handleChange={toggleShowInGame}
          label="Hide game in playing state"
        />
      </div>
      <div
        className="scrollable-div"
        style={{ maxHeight: '65%', overflowY: 'auto' }}
      >
        <Table linesObj={filteredData} />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Button onClick={() => (location.hash = '#create-game')}>
          Create Game
        </Button>
      </div>
    </>
  )
}
