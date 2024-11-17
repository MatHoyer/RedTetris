import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { InputRange, InputText } from '../components/Inputs';

import socket from '../socket.js';
// import { Events } from '../../../events/index';

export const CreateGame = () => {
  const [data, setData] = useState({ name: '', number: 2 });

  const handleChange = (event) => {
    setData({ ...data, [event.target.id]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // socket.emit(Events.NEW_GAME, createNewGame(data.name, data.number));
  };

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <InputText id="name" handleChange={handleChange} label="Name of the game: " />
        </div>
        <div className="form-group">
          <InputRange
            id="number"
            handleChange={handleChange}
            defaultValue={2}
            min={2}
            max={10}
            label={`Max number of players: ${data.number} `}
          />
        </div>
        <div>
          <Button disabled={data.name === ''} style={{ display: 'block', width: '100%' }} type="submit">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};
