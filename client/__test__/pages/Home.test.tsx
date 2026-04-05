import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { store, changeName } from '../../src/redux';
import { Home } from '../../src/pages/Home';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

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
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('img[alt="Title"]')).toBeTruthy();
    const buttons = div.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(div.textContent).toMatch(/Solo|Online/);
    const onlineLink = div.querySelector('a[href="/online"]');
    expect(onlineLink).toBeTruthy();
  });

  it('clicking Solo calls createGame API with maxPlayers 1 and solo-{userName}', async () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeName('Alice'));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>,
      );
    });
    const soloBtn = Array.from(div.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Solo');
    expect(soloBtn).toBeTruthy();
    fetchSpy.mockClear();
    await act(async () => {
      soloBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/games',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ roomName: 'solo-Alice', maxPlayers: 1 }),
      }),
    );
  });

  it('shows AppLoader in Solo button while loading after click', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeName('Alice'));
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>,
      );
    });
    const soloBtn = Array.from(div.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Solo');
    act(() => {
      soloBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(div.querySelector('.animate-spin')).toBeTruthy();
  });
});
