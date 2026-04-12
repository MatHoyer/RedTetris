import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CreateGame } from '../../src/pages/CreateGame';
import { store } from '../../src/redux';
import { setInputValue } from '../helpers';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('CreateGame', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ roomName: 'my-room' }), { status: 200 }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders Back link, room name input, max players range and Create button', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <CreateGame />
          </MemoryRouter>
        </Provider>,
      );
    });
    const backLink = div.querySelector('a[href="/online"]');
    expect(backLink?.textContent).toMatch(/Back/i);
    expect(div.querySelector('#roomName')).toBeTruthy();
    expect(div.querySelector('label[for="roomName"]')?.textContent).toMatch(/Room name/i);
    expect(div.querySelector('#number')).toBeTruthy();
    const submitBtn = div.querySelector('button[type="submit"]');
    expect(submitBtn?.textContent).toMatch(/Create/i);
  });

  it('submit with empty roomName does not call API', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <CreateGame />
          </MemoryRouter>
        </Provider>,
      );
    });
    fetchSpy.mockClear();
    const form = div.querySelector('form');
    act(() => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('submit with roomName and maxPlayers calls createGame API', async () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <CreateGame />
          </MemoryRouter>
        </Provider>,
      );
    });
    const roomInput = div.querySelector('#roomName') as HTMLInputElement;
    const rangeInput = div.querySelector('#number') as HTMLInputElement;
    act(() => {
      setInputValue(roomInput, ' my-room ');
    });
    act(() => {
      setInputValue(rangeInput, '4');
    });
    fetchSpy.mockClear();
    await act(async () => {
      (div.querySelector('form') as HTMLFormElement).dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/games',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ roomName: 'my-room', maxPlayers: 4, modes: [] }),
      }),
    );
  });
});
