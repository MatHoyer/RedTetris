import { ArrowLeft, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { TGame } from '../../../events';
import { Button } from '../components/Button';
import { InputCheckbox, InputText } from '../components/Inputs';
import { Table, TableCell, TableLine } from '../components/Table';
import { useToggle } from '../hooks/useToggle';
import { joinGame, type AppDispatch, type RootState } from '../redux';

export const Online = () => {
  const { toggle: showInGame, setToggle: toggleShowInGame } = useToggle(true);
  const [research, setResearch] = useState('');
  const gamesList = useSelector((state: RootState) => state.gamesList);
  const user = useSelector((state: RootState) => state.user);
  const [filteredData, setFilteredData] = useState<TGame[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setFilteredData(
      gamesList.filter((game) => {
        if (research && !game.admin.name.toLowerCase().includes(research.toLowerCase())) return false;
        if (showInGame && game.active) return false;
        return true;
      }),
    );
  }, [gamesList, research, showInGame]);

  const handleJoin = async (roomName: string) => {
    const result = await dispatch(joinGame(roomName));
    if (joinGame.fulfilled.match(result)) {
      navigate(`/${roomName}/${user.name}`);
    }
  };

  return (
    <div>
      <div style={{ padding: '10px 20px' }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'white', textDecoration: 'none' }}
        >
          <ArrowLeft size={20} /> Back
        </Link>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'end',
          gap: '20px',
        }}
      >
        <InputText id={research} label="research: " onChange={(e) => setResearch(e.target.value)} value={research} />
        <InputCheckbox id="gameCheck" onChange={() => toggleShowInGame()} label="Hide game in playing state" />
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
                      disabled={lineData.players.length === lineData.maxPlayers || lineData.active}
                      onClick={lineData.active ? undefined : () => handleJoin(lineData.id)}
                    >
                      Join
                    </Button>
                  </TableCell>
                </TableLine>
              ))}
            </Table>
          ) : (
            <div style={{ marginTop: '20px' }}>No games</div>
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
