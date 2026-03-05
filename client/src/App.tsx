import { useEffect, useRef } from 'react';
import { Navbar } from './components/NavBar';
import { Pages } from './pages/Pages';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Events, type TTetromino } from '../../events';
import { EmptyCell } from './globals';
import {
  changeId,
  changeName,
  updateGamesList,
  updateBoard,
  setScore,
  setNextPiece,
  setStatus,
  updatePlayerData,
  updateSpectrum,
  store,
  type RootState,
} from './redux';
import socket from './socket';

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const userNameRef = useRef(user.name);
  userNameRef.current = user.name;

  useEffect(() => {
    socket.on(Events.PLAYER_CREATED, ({ id }) => {
      console.log('PLAYER_CREATED', id);
      dispatch(changeId(id));
    });

    socket.on(Events.PLAYER_UPDATED, ({ id, name }: { id: string; name: string }) => {
      console.log('PLAYER_UPDATED', id, name);
      dispatch(changeId(id));
      dispatch(changeName(name));
      if (id && window.location.pathname === '/login-hub') navigate('/', { replace: true });
    });

    socket.on(Events.UPDATED_GAME_LIST, ({ sessions }) => {
      console.log('UPDATED_GAME_LIST', sessions);
      dispatch(updateGamesList(sessions));
    });

    socket.on(Events.GAME_CREATED, ({ roomName }: { roomName: string }) => {
      console.log('GAME_CREATED', roomName);
      const path = window.location.pathname;
      if (!path.startsWith(`/${roomName}/`)) {
        navigate(`/${roomName}/${userNameRef.current}`);
      }
    });

    socket.on(Events.GAME_JOINED, ({ roomName }: { roomName: string }) => {
      console.log('GAME_JOINED', roomName);
      const path = window.location.pathname;
      if (!path.startsWith(`/${roomName}/`)) {
        navigate(`/${roomName}/${userNameRef.current}`);
      }
    });

    socket.on(Events.GAME_STARTED, ({ roomName }: { roomName: string }) => {
      console.log('GAME_STARTED', roomName);
      navigate(`/${roomName}/${userNameRef.current}/game`);
    });

    socket.on(Events.UPDATED_BOARD, ({ board }: { board: (TTetromino | 'empty' | 'penalty')[][] }) => {
      dispatch(updateBoard(board.map((row) => row.map((cell) => cell ?? EmptyCell))));
    });
    socket.on(Events.UPDATED_SCORE, ({ score }: { score: number }) => {
      dispatch(setScore(score));
    });
    socket.on(
      Events.UPDATED_NEXT_PIECE,
      ({ nextPiece, nextPieceShape }: { nextPiece: TTetromino; nextPieceShape: number[][] }) => {
        dispatch(setNextPiece({ nextPiece, nextPieceShape }));
      },
    );
    socket.on(
      Events.UPDATED_GAME_DATA,
      ({ player }: { player: { id: number; name: string; alive: boolean; score: number } }) => {
        if (player.id !== store.getState().user.id) {
          dispatch(updatePlayerData(player));
        }
      },
    );
    socket.on(Events.UPDATED_SPECTRUM, ({ playerId, spectrum }: { playerId: number; spectrum: number[] }) => {
      dispatch(updateSpectrum({ playerId, spectrum }));
    });
    socket.on(Events.GAME_ENDED, ({ status }: { status: 'win' | 'loose' }) => {
      dispatch(setStatus(status));
    });

    socket.connect();

    return () => {
      socket.off(Events.PLAYER_CREATED);
      socket.off(Events.PLAYER_UPDATED);
      socket.off(Events.UPDATED_GAME_LIST);
      socket.off(Events.GAME_CREATED);
      socket.off(Events.GAME_JOINED);
      socket.off(Events.GAME_STARTED);
      socket.off(Events.UPDATED_BOARD);
      socket.off(Events.UPDATED_SCORE);
      socket.off(Events.UPDATED_NEXT_PIECE);
      socket.off(Events.UPDATED_GAME_DATA);
      socket.off(Events.UPDATED_SPECTRUM);
      socket.off(Events.GAME_ENDED);
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <div className="background-image" />
      <div>
        <Navbar />
        <div style={{ height: 'calc(100vh - 65px)' }}>
          <Pages />
        </div>
      </div>
    </div>
  );
};

export default App;
