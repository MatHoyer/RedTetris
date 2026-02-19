import { useState } from 'react';
import { Events } from '../../../events';
import { Button } from '../components/Button';
import { InputRange, InputText } from '../components/Inputs';
import socket from '../socket';

export const CreateGame = () => {
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [roomName, setRoomName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    socket.emit(Events.NEW_GAME, { roomName: roomName.trim(), maxPlayers });
  };

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <InputText
            id="roomName"
            label="Room name:"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
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
