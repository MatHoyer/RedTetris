import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Events, type TGame } from '../../../events';
import { Button } from '../components/Button';
import { InputCheckbox, InputText } from '../components/Inputs';
import { Table, TableCell, TableLine } from '../components/Table';
import { useToggle } from '../hooks/useToggle';
import { type RootState } from '../redux';
import socket from '../socket';

export const Online = () => {
  const { toggle: showInGame, setToggle: toggleShowInGame } = useToggle(true);
  const [research, setResearch] = useState('');
  const gamesList = useSelector((state: RootState) => state.gamesList);
  const [filteredData, setFilteredData] = useState<TGame[]>([]);

  useEffect(() => {
    socket.emit(Events.UPDATE_GAMES_LIST);
  }, []);

  useEffect(() => {
    setFilteredData(
      gamesList.filter((game) => {
        if (research && !game.admin.name.toLowerCase().includes(research.toLowerCase())) return false;
        if (showInGame && game.active) return false;
        return true;
      })
    );
  }, [gamesList, research, showInGame]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'end',
          gap: '20px',
        }}
      >
        <InputText id={research} label="research: " onChange={(e) => setResearch(e.target.value)} value={research} />
        <InputCheckbox id="gameCheck" onChange={toggleShowInGame} label="Hide game in playing state" />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
          marginBottom: '20px',
        }}
      >
        <div
          className="scrollable-div"
          style={{
            display: 'flex',
            justifyContent: 'center',
            maxHeight: '65%',
            overflowY: 'auto',
            width: '100%',
          }}
        >
          {filteredData.length ? (
            <Table header={['id', 'admin', 'players', 'is active', '']}>
              {filteredData.map((lineData: TGame) => (
                <TableLine key={lineData.id}>
                  <TableCell>{lineData.id}</TableCell>
                  <TableCell>{lineData.admin.name}</TableCell>
                  <TableCell>
                    {lineData.players.length}/{lineData.maxPlayers}
                  </TableCell>
                  <TableCell>{lineData.active ? <Check /> : <X />}</TableCell>
                  <TableCell>
                    <Button
                      disabled={lineData.players.length === lineData.maxPlayers}
                      onClick={() => {
                        socket.emit(Events.JOIN_GAME, { gameId: lineData.id });
                      }}
                    >
                      Join
                    </Button>
                  </TableCell>
                </TableLine>
              ))}
            </Table>
          ) : (
            <div
              style={{
                marginTop: '20px',
              }}
            >
              No games
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Link to="/create-game">
          <Button>Create Game</Button>
        </Link>
      </div>
    </div>
  );
};
