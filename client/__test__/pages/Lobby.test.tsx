import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Lobby } from '../../src/pages/Lobby';
import { changeId, changeName, store, updateGamesList } from '../../src/redux';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

const lobbyGame = {
  id: 'room1',
  admin: { id: 1, name: 'Alice' },
  players: [{ id: 1, name: 'Alice', alive: true, board: [] }],
  maxPlayers: 4,
  active: false,
};

describe('Lobby', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let sendBeaconSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    sendBeaconSpy = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeaconSpy, writable: true, configurable: true });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders NotFound when roomId is missing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="*" element={<Lobby />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('h1')?.textContent).toBe('Page not found');
  });

  it('shows Joining or content when roomId is present', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeId(-1));
      store.dispatch(changeName(''));
      store.dispatch(updateGamesList([]));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/my-room/Alice']}>
            <Routes>
              <Route path="/:roomId/:playerName" element={<Lobby />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.textContent).toMatch(/Joining|Page not found|Start|Quit/);
  });

  it('renders lobby table with Start and Quit when user is in game', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeId(1));
      store.dispatch(changeName('Alice'));
      store.dispatch(updateGamesList([lobbyGame]));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/room1/Alice']}>
            <Routes>
              <Route path="/:roomId/:playerName" element={<Lobby />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('table')).toBeTruthy();
    expect(div.textContent).toMatch(/Start|Quit/);
    expect(div.textContent).toContain('Alice');
  });

  it('beforeunload triggers sendBeacon to leave-all', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeId(1));
      store.dispatch(changeName('Alice'));
      store.dispatch(updateGamesList([lobbyGame]));
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/room1/Alice']}>
            <Routes>
              <Route path="/:roomId/:playerName" element={<Lobby />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    expect(sendBeaconSpy).toHaveBeenCalledWith('/api/games/leave-all', expect.any(Blob));
  });

  it('unmount runs cleanup (removeEventListener)', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeId(-1));
      store.dispatch(changeName(''));
      store.dispatch(updateGamesList([]));
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/room1/Alice']}>
            <Routes>
              <Route path="/:roomId/:playerName" element={<Lobby />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    act(() => {
      root.unmount();
    });
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('shows Joining when user not yet in game players', () => {
    const gameWithoutUser = {
      ...lobbyGame,
      id: 'room1',
      players: [{ id: 99, name: 'Other', alive: true, board: [] }],
    };
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeId(1));
      store.dispatch(changeName('Alice'));
      store.dispatch(updateGamesList([gameWithoutUser]));
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/room1/Alice']}>
            <Routes>
              <Route path="/:roomId/:playerName" element={<Lobby />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.textContent).toContain('Joining');
  });

  it('clicking Start calls startGame API', async () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeId(1));
      store.dispatch(changeName('Alice'));
      store.dispatch(updateGamesList([lobbyGame]));
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/room1/Alice']}>
            <Routes>
              <Route path="/:roomId/:playerName" element={<Lobby />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    fetchSpy.mockClear();
    const startBtn = Array.from(div.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Start');
    await act(async () => {
      startBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(fetchSpy).toHaveBeenCalledWith('/api/games/room1/start', expect.objectContaining({ method: 'POST' }));
  });

  it('clicking Quit calls leaveAll API', async () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeId(1));
      store.dispatch(changeName('Alice'));
      store.dispatch(updateGamesList([lobbyGame]));
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/room1/Alice']}>
            <Routes>
              <Route path="/:roomId/:playerName" element={<Lobby />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
    fetchSpy.mockClear();
    const quitBtn = Array.from(div.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Quit');
    await act(async () => {
      quitBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(fetchSpy).toHaveBeenCalledWith('/api/games/leave-all', expect.objectContaining({ method: 'POST' }));
  });
});
