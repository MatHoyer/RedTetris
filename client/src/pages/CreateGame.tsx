import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { InputRange, InputText } from '../components/Inputs';
import { createGame, type AppDispatch, type RootState } from '../redux';

export const CreateGame = () => {
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [roomName, setRoomName] = useState('');
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    const result = await dispatch(createGame({ roomName: roomName.trim(), maxPlayers }));
    if (createGame.fulfilled.match(result)) {
      navigate(`/${roomName.trim()}/${user.name}`);
    }
  };

  return (
    <div>
      <div style={{ padding: '10px 20px' }}>
        <Link
          to="/online"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'white',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={20} /> Back
        </Link>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <InputText id="roomName" label="Room name:" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
        </div>
        <div className="form-group">
          <InputRange
            id="number"
            onChange={(e) => {
              setMaxPlayers(e.target.valueAsNumber);
            }}
            defaultValue={2}
            min={2}
            max={10}
            label={`Max number of players: ${maxPlayers} `}
          />
        </div>
        <div>
          <Button style={{ display: 'block', width: '100%' }} type="submit">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};
