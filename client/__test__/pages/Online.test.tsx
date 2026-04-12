import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Online } from '../../src/pages/Online';
import { store, updateGamesList } from '../../src/redux';

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

const renderOnline = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Online />
      </MemoryRouter>
    </Provider>,
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
    store.dispatch(updateGamesList([]));
    const { container } = renderOnline();
    expect(container.querySelector('a[href="/"]')?.textContent).toMatch(/Back/i);
    expect(container.textContent).toMatch(/No games/);
    expect(container.querySelector('a[href="/create-game"]')).toBeTruthy();
    expect(screen.getByText(/Create Game/i)).toBeTruthy();
  });

  it('renders table with games when gamesList has data', () => {
    store.dispatch(updateGamesList([mockGame()]));
    const { container } = renderOnline();
    expect(container.querySelector('table')).toBeTruthy();
    expect(container.textContent).toContain('room-a');
    expect(container.textContent).toContain('Admin');
    expect(container.textContent).toMatch(/1\/4/);
    expect(screen.getAllByText('Join').length).toBeGreaterThan(0);
  });

  it('filters games by research text on admin name', () => {
    store.dispatch(
      updateGamesList([
        mockGame({ id: 'r1', admin: { name: 'Alice' } }),
        mockGame({ id: 'r2', admin: { name: 'Bob' } }),
      ]),
    );
    const { container } = renderOnline();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
    const researchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.change(researchInput, { target: { value: 'alice' } });
    expect(container.textContent).toContain('Alice');
    expect(container.textContent).not.toContain('Bob');
    fireEvent.change(researchInput, { target: { value: 'xyz' } });
    expect(container.textContent).toMatch(/No games/);
  });

  it('filter showInGame hides active games by default, checkbox click shows them', () => {
    store.dispatch(updateGamesList([mockGame({ id: 'active-room', active: true })]));
    const { container } = renderOnline();
    expect(container.textContent).toMatch(/No games/);
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(container.querySelector('table')).toBeTruthy();
    expect(container.textContent).toContain('active-room');
  });

  it('active game shows Join disabled', () => {
    store.dispatch(updateGamesList([mockGame({ id: 'r1', active: true })]));
    const { container } = renderOnline();
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(checkbox);
    const joinBtns = screen.getAllByText('Join');
    expect((joinBtns[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it('Join disabled when room is full', () => {
    store.dispatch(
      updateGamesList([
        mockGame({
          id: 'full-room',
          players: [{ id: 1 }, { id: 2 }],
          maxPlayers: 2,
        }),
      ]),
    );
    renderOnline();
    const joinBtns = screen.getAllByText('Join');
    expect((joinBtns[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it('clicking Join calls joinGame API', async () => {
    store.dispatch(updateGamesList([mockGame({ id: 'join-me' })]));
    renderOnline();
    fetchSpy.mockClear();
    const joinBtns = screen.getAllByText('Join');
    fireEvent.click(joinBtns[0]);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/games/join-me/join', expect.objectContaining({ method: 'POST' }));
    });
  });
});
