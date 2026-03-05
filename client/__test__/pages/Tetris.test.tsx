import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Events } from '../../../events';
import { Tetris } from '../../src/pages/Tetris';
import {
  changeId,
  changeName,
  resetBoard,
  resetGame,
  setNextPiece,
  setScore,
  setStatus,
  store,
  updateGamesList,
  updatePlayerData,
  updateSpectrum,
} from '../../src/redux';
import socket from '../../src/socket';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  return { ...mod, useNavigate: () => mockNavigate };
});

vi.mock('../../src/socket', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

const tetrisGame = {
  id: 'room1',
  admin: { id: 1, name: 'Alice' },
  players: [{ id: 1, name: 'Alice', alive: true, board: [] }],
  maxPlayers: 4,
  active: false,
};

function renderTetris(initialEntries = ['/room1/Alice/game']) {
  const div = document.createElement('div');
  const root = createRoot(div);
  act(() => {
    root.render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/:roomId/:playerName/game" element={<Tetris />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  });
  return { div, root };
}

describe('Tetris', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    store.dispatch(resetBoard());
    store.dispatch(resetGame());
    store.dispatch(changeId(1));
    store.dispatch(changeName('Alice'));
    store.dispatch(updateGamesList([tetrisGame]));
  });

  afterEach(() => {
    store.dispatch(resetBoard());
    store.dispatch(resetGame());
  });

  it('renders NotFound when roomId is missing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="*" element={<Tetris />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('h1')?.textContent).toBe('Page not found');
  });

  it('renders NotFound when game not in store', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/fake-room/Player/game']}>
            <Routes>
              <Route path="/:roomId/:playerName/game" element={<Tetris />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('h1')?.textContent).toBe('Page not found');
  });

  it('renders game UI when game exists and user is in players', () => {
    const { div } = renderTetris();
    expect(div.querySelector('.app')).toBeTruthy();
    expect(div.textContent).toMatch(/TETRIS|Score/);
    expect(div.querySelector('.board')).toBeTruthy();
    expect(div.textContent).toMatch(/Quit|Alice/);
  });

  it('displays score from store', () => {
    store.dispatch(setScore(150));
    const { div } = renderTetris();
    expect(div.textContent).toContain('150');
  });

  it('displays nextPiece preview when nextPieceShape has data', () => {
    store.dispatch(
      setNextPiece({
        nextPiece: 'I',
        nextPieceShape: [[1, 1, 1, 1]],
      }),
    );
    const { div } = renderTetris();
    const cells = div.querySelectorAll('.controls .cell');
    expect(cells.length).toBeGreaterThan(0);
    expect(Array.from(cells).some((c) => c.classList.contains('I'))).toBe(true);
  });

  it('keyup ArrowUp and Space emit key to socket', () => {
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp', bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith('ArrowUp');
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(' ');
  });

  it('keydown ArrowDown/Left/Right then keyup triggers key state and interval emits', () => {
    vi.useFakeTimers();
    vi.mocked(socket.emit).mockClear();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith('ArrowLeft');
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft', bubbles: true }));
    });
    vi.mocked(socket.emit).mockClear();
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(vi.mocked(socket.emit)).not.toHaveBeenCalledWith('ArrowLeft');
    vi.useRealTimers();
  });

  it('keydown with repeat does not update keys', () => {
    vi.mocked(socket.emit).mockClear();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, repeat: true }));
    });
    expect(vi.mocked(socket.emit)).not.toHaveBeenCalled();
  });

  it('renders otherPlayersData with Alive/Dead and score', () => {
    store.dispatch(updatePlayerData({ id: 2, name: 'Bob', alive: true, score: 100 }));
    store.dispatch(updatePlayerData({ id: 3, name: 'Eve', alive: false, score: 50 }));
    const { div } = renderTetris();
    expect(div.textContent).toContain('Bob');
    expect(div.textContent).toContain('Eve');
    expect(div.textContent).toContain('Alive');
    expect(div.textContent).toContain('Dead');
    expect(div.textContent).toContain('100');
    expect(div.textContent).toContain('50');
  });

  it('renders spectrum bars when spectrums[player.id] is set', () => {
    store.dispatch(updatePlayerData({ id: 2, name: 'Bob', alive: true, score: 0 }));
    store.dispatch(updateSpectrum({ playerId: 2, spectrum: [5, 0, 10] }));
    const { div } = renderTetris();
    const spectrumBars = div.querySelectorAll('[style*="height"]');
    expect(spectrumBars.length).toBeGreaterThan(0);
  });

  it('shows win overlay when status is win', () => {
    store.dispatch(setStatus('win'));
    const { div } = renderTetris();
    expect(div.textContent).toMatch(/You won|won/);
  });

  it('shows lost overlay when status is loose', () => {
    store.dispatch(setStatus('loose'));
    const { div } = renderTetris();
    expect(div.textContent).toMatch(/You lost|lost/);
  });

  it('status effect emits LEAVE_GAMES on cleanup', () => {
    vi.mocked(socket.emit).mockClear();
    store.dispatch(setStatus('win'));
    const { root } = renderTetris();
    act(() => {
      root.unmount();
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.LEAVE_GAMES);
  });

  it('Quit link click emits LEAVE_GAMES', () => {
    const { div } = renderTetris();
    const quitLink = div.querySelector('a[href="/"]');
    act(() => {
      quitLink?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.LEAVE_GAMES);
  });

  it('unmount dispatches resetBoard and resetGame', () => {
    store.dispatch(setScore(999));
    const { root } = renderTetris();
    act(() => {
      root.unmount();
    });
    expect(
      store
        .getState()
        .board.flat()
        .every((c) => c === 'Empty'),
    ).toBe(true);
    expect(store.getState().game.score).toBe(0);
  });

  it('status effect navigates to / after 5s when status is set', () => {
    vi.useFakeTimers();
    store.dispatch(setStatus('win'));
    renderTetris();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
    vi.useRealTimers();
  });

  it('renders NotFound when user is not in game players', () => {
    const gameWithoutUser = {
      ...tetrisGame,
      id: 'room1',
      players: [{ id: 99, name: 'Other', alive: true, board: [] }],
    };
    store.dispatch(updateGamesList([gameWithoutUser]));
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/room1/Alice/game']}>
            <Routes>
              <Route path="/:roomId/:playerName/game" element={<Tetris />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('h1')?.textContent).toBe('Page not found');
  });
});
