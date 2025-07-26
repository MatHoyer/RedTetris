import { useState } from 'react';
import { Events } from '../../../events/index';
import { Button } from '../components/Button';
import { InputText } from '../components/Inputs';
import socket from '../socket';

export const LoginHub = () => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit(Events.UPDATE_PLAYER, { name: text });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10%',
          flexDirection: 'column',
        }}
      >
        <img src="/assets/RedTetris-logo.png" alt="Title" />
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <InputText
              id="nameSelect"
              onChange={(e) => setText(e.target.value)}
              label="Select you're username"
              value={text}
              autoFocus
            />
            <Button
              type="submit"
              onClick={() => {
                socket.emit(Events.UPDATE_PLAYER, { name: text });
              }}
            >
              Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
