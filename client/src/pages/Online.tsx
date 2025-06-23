import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Events, type TGame } from '../../../events';
import { Button } from '../components/Button';
import { InputCheckbox, InputText } from '../components/Inputs';
import { Table, TableCell, TableLine } from '../components/Table';
import { useToggle } from '../hooks/useToggle';
import { updateGamesList, type RootState } from '../redux';
import socket from '../socket';

export const Online = () => {
  const { toggle: showInGame, setToggle: toggleShowInGame } = useToggle(true);
  const [research, setResearch] = useState('');
  const gamesList = useSelector((state: RootState) => state.gamesList);
  const [filteredData, setFilteredData] = useState<TGame[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.emit(Events.UPDATE_GAMES_LIST);

    socket.on(Events.UPDATED_GAME_LIST, ({ sessions }) => {
      dispatch(updateGamesList(sessions));
    });

    return () => {
      socket.off(Events.UPDATED_GAME_LIST);
    };
  }, []);

  useEffect(() => {
    setFilteredData(
      gamesList.filter((game) => {
        if (research && !game.admin.toLowerCase().includes(research.toLowerCase())) return false;
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
        <div className="scrollable-div" style={{ maxHeight: '65%', overflowY: 'auto', width: '100%' }}>
          <Table header={['id', 'admin', 'players', 'is active', '']}>
            {filteredData.map((lineData: TGame) => (
              <TableLine key={lineData.id}>
                <TableCell>{lineData.id}</TableCell>
                <TableCell>{lineData.admin}</TableCell>
                <TableCell>
                  {lineData.players.length}/{lineData.maxPlayers}
                </TableCell>
                <TableCell>{lineData.active}</TableCell>
                <TableCell>
                  <Button>yop</Button>
                </TableCell>
              </TableLine>
            ))}
          </Table>
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
