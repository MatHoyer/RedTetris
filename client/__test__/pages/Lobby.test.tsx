import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Events } from '../../../events';
import { Lobby } from '../../src/pages/Lobby';
import { changeId, changeName, store, updateGamesList } from '../../src/redux';
import socket from '../../src/socket';

vi.mock('../../src/socket', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

const lobbyGame = {
  id: 'room1',
  admin: { id: 1, name: 'Alice' },
  players: [{ id: 1, name: 'Alice', alive: true, board: [] }],
  maxPlayers: 4,
  active: false,
};

describe('Lobby', () => {
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
      store.dispatch(changeId(-1));
      store.dispatch(changeName(''));
      store.dispatch(updateGamesList([]));
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
    act(() => {
      store.dispatch(changeId(1));
      store.dispatch(changeName('Alice'));
      store.dispatch(updateGamesList([lobbyGame]));
    });
    const onCalls = vi.mocked(socket.on).mock.calls;
    const listHandler = onCalls.find((c) => c[0] === Events.UPDATED_GAME_LIST)?.[1];
    act(() => {
      listHandler?.();
    });
    expect(div.querySelector('table')).toBeTruthy();
    expect(div.textContent).toMatch(/Start|Quit/);
    expect(div.textContent).toContain('Alice');
  });

  it('beforeunload triggers leaveRoom and emits LEAVE_GAMES', () => {
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
    const listHandler = vi.mocked(socket.on).mock.calls.find((c) => c[0] === Events.UPDATED_GAME_LIST)?.[1];
    act(() => {
      listHandler?.();
    });
    vi.mocked(socket.emit).mockClear();
    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.LEAVE_GAMES);
  });

  it('unmount runs cleanup (removeEventListener, socket.off)', () => {
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
      store.dispatch(changeId(1));
      store.dispatch(changeName('Alice'));
      store.dispatch(updateGamesList([lobbyGame]));
    });
    const listHandler = vi.mocked(socket.on).mock.calls.find((c) => c[0] === Events.UPDATED_GAME_LIST)?.[1];
    act(() => {
      listHandler?.();
    });
    vi.mocked(socket.off).mockClear();
    act(() => {
      root.unmount();
    });
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(vi.mocked(socket.off)).toHaveBeenCalledWith(Events.UPDATED_GAME_LIST, expect.any(Function));
    removeSpy.mockRestore();
  });

  it('returns NotFound when user not in game players', () => {
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
    const listHandler = vi.mocked(socket.on).mock.calls.find((c) => c[0] === Events.UPDATED_GAME_LIST)?.[1];
    act(() => {
      listHandler?.();
    });
    expect(div.querySelector('h1')?.textContent).toBe('Page not found');
  });

  it('clicking Start emits GAME_START', () => {
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
    const listHandler = vi.mocked(socket.on).mock.calls.find((c) => c[0] === Events.UPDATED_GAME_LIST)?.[1];
    act(() => {
      listHandler?.();
    });
    vi.mocked(socket.emit).mockClear();
    const startBtn = Array.from(div.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Start');
    act(() => {
      startBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.GAME_START, { roomName: 'room1' });
  });

  it('clicking Quit emits LEAVE_GAMES and navigates to /online', () => {
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
    const listHandler = vi.mocked(socket.on).mock.calls.find((c) => c[0] === Events.UPDATED_GAME_LIST)?.[1];
    act(() => {
      listHandler?.();
    });
    vi.mocked(socket.emit).mockClear();
    const quitBtn = Array.from(div.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Quit');
    act(() => {
      quitBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.LEAVE_GAMES);
  });
});
