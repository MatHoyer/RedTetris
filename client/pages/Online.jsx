import { Button } from '../components/Button'
import data from '../assets/data.json'
import { useState } from 'react'
import { useToggle } from '../hooks/useToggle'
import { InputCheckbox, InputText } from '../components/Inputs'
import { Table } from '../components/Table'

export const Online = () => {
  const { toggle: showInGame, setToggle: toggleShowInGame } = useToggle(true)
  const [research, setResearch] = useState('')

  const filteredData = data
    .filter((cell) => {
      if (research && !cell.name.toLowerCase().includes(research.toLowerCase()))
        return false
      if (showInGame && cell.status) return false
      return true
    })
    .map((cell) => ({
      name: cell.name,
      nbPlayers: cell.nbPlayers,
      status: cell.status ? 'in game' : 'waiting...',
      join: <Button disabled={cell.status}>Join</Button>,
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
