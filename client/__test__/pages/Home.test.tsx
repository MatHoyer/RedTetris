import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { store, changeName } from '../../src/redux';
import { Home } from '../../src/pages/Home';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

const renderHome = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </Provider>,
  );

describe('Home', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ roomName: 'solo-Alice' }), { status: 200 }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders title image and Solo / Online buttons', () => {
    const { container } = renderHome();
    expect(container.querySelector('img[alt="Title"]')).toBeTruthy();
    expect(container.querySelectorAll('button').length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).toMatch(/Solo|Online/);
    expect(container.querySelector('a[href="/online"]')).toBeTruthy();
  });

  it('clicking Solo calls createGame API with maxPlayers 1 and solo-{userName}', async () => {
    store.dispatch(changeName('Alice'));
    const { container } = renderHome();
    const soloBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Solo')!;
    fetchSpy.mockClear();
    fireEvent.click(soloBtn);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/games',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ roomName: 'solo-Alice', maxPlayers: 1, modes: [] }),
        }),
      );
    });
  });

  it('shows AppLoader in Solo button while loading after click', async () => {
    store.dispatch(changeName('Alice'));
    const { container } = renderHome();
    const soloBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Solo')!;
    fireEvent.click(soloBtn);
    await waitFor(() => {
      expect(container.querySelector('.animate-spin')).toBeTruthy();
    });
  });
});
