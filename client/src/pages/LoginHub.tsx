import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { InputText } from '../components/Inputs';
import { updatePlayer, type AppDispatch } from '../redux';

export const LoginHub = () => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const result = await dispatch(updatePlayer(text));
    if (updatePlayer.rejected.match(result)) {
      setError(result.payload as string);
    } else {
      navigate('/', { replace: true });
    }
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <InputText
                id="nameSelect"
                onChange={(e) => setText(e.target.value)}
                label="Select you're username"
                value={text}
                autoFocus
              />
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
            <Button type="submit">Register</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
