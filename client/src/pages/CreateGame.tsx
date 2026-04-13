import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { TGameMode } from '../../../events';
import { Button } from '../components/Button';
import { InputRange, InputText } from '../components/Inputs';
import { createGame, type AppDispatch, type RootState } from '../redux';

const GAME_MODES: { value: TGameMode; label: string }[] = [
  { value: 'fast', label: 'Fast (2x gravity)' },
  { value: 'inverted', label: 'Inverted controls' },
  { value: 'easy', label: 'Easy (ghost piece)' },
];

export const CreateGame = () => {
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [roomName, setRoomName] = useState('');
  const [modes, setModes] = useState<TGameMode[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);

  const toggleMode = (mode: TGameMode) => {
    setModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    const result = await dispatch(createGame({ roomName: roomName.trim(), maxPlayers, modes }));
    if (createGame.fulfilled.match(result)) {
      navigate(`/${roomName.trim()}/${user.name}`);
    } else {
      setError(result.payload as string);
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
            max={8}
            label={`Max number of players: ${maxPlayers} `}
          />
        </div>
        <div className="form-group">
          <label>Game modes:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {GAME_MODES.map(({ value, label }) => (
              <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={modes.includes(value)} onChange={() => toggleMode(value)} />
                {label}
              </label>
            ))}
          </div>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <Button style={{ display: 'block', width: '100%' }} type="submit" disabled={!roomName.trim()}>
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};
