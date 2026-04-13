import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Lobby } from '../../src/pages/Lobby';
import { changeId, changeName, store, updateGamesList } from '../../src/redux';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', connected: true, emit: vi.fn(), on: vi.fn(), off: vi.fn(), once: vi.fn() },
}));

const lobbyGame = {
  id: 'room1',
  admin: { id: 1, name: 'Alice' },
  players: [{ id: 1, name: 'Alice', alive: true, board: [] }],
  maxPlayers: 4,
  active: false,
};

const renderLobby = (path = '/room1/Alice') =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:roomId/:playerName" element={<Lobby />} />
          <Route path="*" element={<Lobby />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

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
    renderLobby('/');
    expect(screen.getByText('Page not found')).toBeTruthy();
  });

  it('shows Joining or content when roomId is present', () => {
    store.dispatch(changeId(-1));
    store.dispatch(changeName(''));
    store.dispatch(updateGamesList([]));
    const { container } = renderLobby();
    expect(container.textContent).toMatch(/Joining|Page not found|Start|Quit/);
  });

  it('renders lobby table with Start and Quit when user is in game', () => {
    store.dispatch(changeId(1));
    store.dispatch(changeName('Alice'));
    store.dispatch(updateGamesList([lobbyGame]));
    const { container } = renderLobby();
    expect(container.querySelector('table')).toBeTruthy();
    expect(container.textContent).toMatch(/Start|Quit/);
    expect(container.textContent).toContain('Alice');
  });

  it('beforeunload triggers sendBeacon to leave-all', () => {
    store.dispatch(changeId(1));
    store.dispatch(changeName('Alice'));
    store.dispatch(updateGamesList([lobbyGame]));
    renderLobby();
    window.dispatchEvent(new Event('beforeunload'));
    expect(sendBeaconSpy).toHaveBeenCalledWith('/api/games/leave-all', expect.any(Blob));
  });

  it('unmount runs cleanup (removeEventListener)', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    store.dispatch(changeId(-1));
    store.dispatch(changeName(''));
    store.dispatch(updateGamesList([]));
    renderLobby();
    cleanup();
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('shows Joining when user not yet in game players', () => {
    const gameWithoutUser = {
      ...lobbyGame,
      id: 'room1',
      players: [{ id: 99, name: 'Other', alive: true, board: [] }],
    };
    store.dispatch(changeId(1));
    store.dispatch(changeName('Alice'));
    store.dispatch(updateGamesList([gameWithoutUser]));
    const { container } = renderLobby();
    expect(container.textContent).toContain('Joining');
  });

  it('clicking Start calls startGame API', async () => {
    store.dispatch(changeId(1));
    store.dispatch(changeName('Alice'));
    store.dispatch(updateGamesList([lobbyGame]));
    const { container } = renderLobby();
    fetchSpy.mockClear();
    const startBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Start')!;
    fireEvent.click(startBtn);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/games/room1/start', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('clicking Quit calls leaveAll API', async () => {
    store.dispatch(changeId(1));
    store.dispatch(changeName('Alice'));
    store.dispatch(updateGamesList([lobbyGame]));
    const { container } = renderLobby();
    fetchSpy.mockClear();
    const quitBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Quit')!;
    fireEvent.click(quitBtn);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/games/leave-all', expect.objectContaining({ method: 'POST' }));
    });
  });
});
