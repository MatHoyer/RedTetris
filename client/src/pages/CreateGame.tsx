import { useState } from 'react';
import { Events } from '../../../events';
import { Button } from '../components/Button';
import { InputRange } from '../components/Inputs';
import socket from '../socket';

export const CreateGame = () => {
  const [maxPlayers, setMaxPlayers] = useState(2);

  const handleSubmit = () => {
    socket.emit(Events.NEW_GAME, { maxPlayers });
  };

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
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
