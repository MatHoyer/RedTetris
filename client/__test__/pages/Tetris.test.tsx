import React, { act } from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
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

const renderTetris = (initialEntries = ['/room1/Alice/game']) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/:roomId/:playerName/game" element={<Tetris />} />
          <Route path="*" element={<Tetris />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

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
    renderTetris(['/']);
    expect(screen.getByText('Page not found')).toBeTruthy();
  });

  it('renders NotFound when game not in store', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/fake-room/Player/game']}>
          <Routes>
            <Route path="/:roomId/:playerName/game" element={<Tetris />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
    expect(container.querySelector('h1')?.textContent).toBe('Page not found');
  });

  it('renders game UI when game exists and user is in players', () => {
    const { container } = renderTetris();
    expect(container.querySelector('.app')).toBeTruthy();
    expect(container.textContent).toMatch(/TETRIS|Score/);
    expect(container.querySelector('.board')).toBeTruthy();
    expect(container.textContent).toMatch(/Quit|Alice/);
  });

  it('displays score from store', () => {
    store.dispatch(setScore(150));
    const { container } = renderTetris();
    expect(container.textContent).toContain('150');
  });

  it('displays nextPiece preview when nextPieceShape has data', () => {
    store.dispatch(
      setNextPiece({
        nextPiece: 'I',
        nextPieceShape: [[1, 1, 1, 1]],
      }),
    );
    const { container } = renderTetris();
    const cells = container.querySelectorAll('.controls .cell');
    expect(cells.length).toBeGreaterThan(0);
    expect(Array.from(cells).some((c) => c.classList.contains('I'))).toBe(true);
  });

  it('keydown ArrowUp emits KEY_ROTATE_PRESS and Space emits KEY_HARD_DROP', () => {
    renderTetris();
    vi.mocked(socket.emit).mockClear();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.KEY_ROTATE_PRESS);
    vi.mocked(socket.emit).mockClear();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.KEY_HARD_DROP);
  });

  it('keydown ArrowLeft emits KEY_LEFT_PRESS, keyup emits KEY_LEFT_RELEASE', () => {
    renderTetris();
    vi.mocked(socket.emit).mockClear();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.KEY_LEFT_PRESS);
    vi.mocked(socket.emit).mockClear();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft', bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.KEY_LEFT_RELEASE);
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
    const { container } = renderTetris();
    expect(container.textContent).toContain('Bob');
    expect(container.textContent).toContain('Eve');
    expect(container.textContent).toContain('Alive');
    expect(container.textContent).toContain('Dead');
    expect(container.textContent).toContain('100');
    expect(container.textContent).toContain('50');
  });

  it('renders spectrum bars when spectrums[player.id] is set', () => {
    store.dispatch(updatePlayerData({ id: 2, name: 'Bob', alive: true, score: 0 }));
    store.dispatch(updateSpectrum({ playerId: 2, spectrum: [5, 0, 10] }));
    const { container } = renderTetris();
    const spectrumBars = container.querySelectorAll('[style*="height"]');
    expect(spectrumBars.length).toBeGreaterThan(0);
  });

  it('shows win overlay when status is win', () => {
    store.dispatch(setStatus('win'));
    const { container } = renderTetris();
    expect(container.textContent).toMatch(/You won|won/);
  });

  it('shows lost overlay when status is loose', () => {
    store.dispatch(setStatus('loose'));
    const { container } = renderTetris();
    expect(container.textContent).toMatch(/You lost|lost/);
  });

  it('status effect calls leaveAll API on cleanup', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    store.dispatch(setStatus('win'));
    renderTetris();
    cleanup();
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/games/leave-all', expect.objectContaining({ method: 'POST' }));
    });
    fetchSpy.mockRestore();
  });

  it('Quit link click calls leaveAll API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    renderTetris();
    fetchSpy.mockClear();
    fireEvent.click(screen.getByText('Quit'));
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/games/leave-all', expect.objectContaining({ method: 'POST' }));
    });
    fetchSpy.mockRestore();
  });

  it('unmount dispatches resetBoard and resetGame', () => {
    store.dispatch(setScore(999));
    renderTetris();
    cleanup();
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
    const { container } = renderTetris();
    expect(container.querySelector('h1')?.textContent).toBe('Page not found');
  });
});
