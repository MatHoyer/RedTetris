import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Navbar } from '../../src/components/NavBar';
import { store } from '../../src/redux';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('Navbar', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true })));
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders nav with logo link and settings icon', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('nav')).toBeTruthy();
    const logoLink = div.querySelector('a[href="/"]');
    expect(logoLink).toBeTruthy();
    expect(div.querySelector('img[alt="logo"]')).toBeTruthy();
    expect(div.querySelector('.icon')).toBeTruthy();
    expect(div.querySelector('h1')).toBeFalsy(); // Settings not open
  });

  it('clicking logo link calls leaveAll API', async () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>,
      );
    });
    const logoLink = div.querySelector('a[href="/"]');
    await act(async () => {
      logoLink?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(fetchSpy).toHaveBeenCalledWith('/api/games/leave-all', expect.objectContaining({ method: 'POST' }));
  });

  it('opens settings modal when cog is clicked', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>,
      );
    });
    const cog = div.querySelector('.icon');
    expect(cog).toBeTruthy();
    act(() => {
      cog?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(div.querySelector('h1')?.textContent).toBe('Settings');
    expect(div.querySelector('button')?.textContent).toBe('Close');
  });

  it('closes modal when Close button is clicked', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>,
      );
    });
    const cog = div.querySelector('.icon');
    act(() => {
      cog?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(div.querySelector('h1')?.textContent).toBe('Settings');
    const closeBtn = div.querySelector('button');
    act(() => {
      closeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(div.querySelector('h1')).toBeFalsy();
  });
});
