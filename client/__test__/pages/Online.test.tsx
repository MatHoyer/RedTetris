import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Online } from '../../src/pages/Online';
import { store, updateGamesList } from '../../src/redux';
import { setInputValue } from '../helpers';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

const mockGame = (
  overrides: Partial<{
    id: string;
    admin: { name: string };
    active: boolean;
    players: unknown[];
    maxPlayers: number;
  }> = {},
) =>
  Object.assign(
    {
      id: 'room-a',
      admin: { id: 1, name: 'Admin' },
      players: [{ id: 1, name: 'Admin', alive: true, board: [] }],
      maxPlayers: 4,
      active: false,
    },
    overrides,
  );

describe('Online', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ roomName: 'room-a' }), { status: 200 }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders Back link, filter UI and No games when list is empty', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(updateGamesList([]));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Online />
          </MemoryRouter>
        </Provider>,
      );
    });
    const backLink = div.querySelector('a[href="/"]');
    expect(backLink?.textContent).toMatch(/Back/i);
    expect(div.textContent).toMatch(/No games/);
    const createLink = div.querySelector('a[href="/create-game"]');
    expect(createLink).toBeTruthy();
    expect(div.querySelector('button')?.textContent).toMatch(/Create Game/i);
  });

  it('renders table with games when gamesList has data', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(updateGamesList([mockGame()]));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Online />
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('table')).toBeTruthy();
    expect(div.textContent).toContain('room-a');
    expect(div.textContent).toContain('Admin');
    expect(div.textContent).toMatch(/1\/4/);
    const joinBtns = div.querySelectorAll('button');
    const joinBtn = Array.from(joinBtns).find((b) => b.textContent?.trim() === 'Join');
    expect(joinBtn).toBeTruthy();
  });

  it('filters games by research text on admin name', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(
        updateGamesList([
          mockGame({ id: 'r1', admin: { name: 'Alice' } }),
          mockGame({ id: 'r2', admin: { name: 'Bob' } }),
        ]),
      );
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Online />
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelectorAll('tbody tr')).toHaveLength(2);
    const researchInput = div.querySelector('input[type="text"]') as HTMLInputElement;
    act(() => {
      setInputValue(researchInput, 'alice');
    });
    expect(div.textContent).toContain('Alice');
    expect(div.textContent).not.toContain('Bob');
    act(() => {
      setInputValue(researchInput, 'xyz');
    });
    expect(div.textContent).toMatch(/No games/);
  });

  it('filter showInGame hides active games by default, checkbox click shows them', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(updateGamesList([mockGame({ id: 'active-room', active: true })]));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Online />
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.textContent).toMatch(/No games/);
    const checkbox = div.querySelector('input[type="checkbox"]') as HTMLInputElement;
    act(() => {
      checkbox.click();
    });
    expect(div.querySelector('table')).toBeTruthy();
    expect(div.textContent).toContain('active-room');
  });

  it('active game shows Join disabled', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(updateGamesList([mockGame({ id: 'r1', active: true })]));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Online />
          </MemoryRouter>
        </Provider>,
      );
    });
    const checkbox = div.querySelector('input[type="checkbox"]') as HTMLInputElement;
    act(() => {
      checkbox.click();
    });
    const joinBtn = Array.from(div.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Join');
    expect(joinBtn).toBeTruthy();
    expect((joinBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('Join disabled when room is full', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(
        updateGamesList([
          mockGame({
            id: 'full-room',
            players: [{ id: 1 }, { id: 2 }],
            maxPlayers: 2,
          }),
        ]),
      );
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Online />
          </MemoryRouter>
        </Provider>,
      );
    });
    const joinBtn = Array.from(div.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Join');
    expect((joinBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('clicking Join calls joinGame API', async () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(updateGamesList([mockGame({ id: 'join-me' })]));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Online />
          </MemoryRouter>
        </Provider>,
      );
    });
    fetchSpy.mockClear();
    const joinBtn = Array.from(div.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Join');
    await act(async () => {
      joinBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(fetchSpy).toHaveBeenCalledWith('/api/games/join-me/join', expect.objectContaining({ method: 'POST' }));
  });
});
