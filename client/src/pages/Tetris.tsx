import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Board } from '../components/Board';
import { Button } from '../components/Button';

export const Tetris = () => {
  const [score, setScore] = useState(0);

  return (
    <div className="app">
      <h1 className="text-4xl font-bold text-center text-blue-500 py-2">TETRIS</h1>
      <Board />
      <div className="controls">
        <h2>Score: {score}</h2>
        <Link to="/">
          <Button>Quit</Button>
        </Link>
      </div>
    </div>
  );
};
