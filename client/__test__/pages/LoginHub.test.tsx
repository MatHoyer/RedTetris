import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { LoginHub } from '../../src/pages/LoginHub';
import { store } from '../../src/redux';
import { setInputValue } from '../helpers';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('LoginHub', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1, name: 'Bob' }), { status: 200 }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders form with username input and Register button', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <LoginHub />
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('img[alt="Title"]')).toBeTruthy();
    expect(div.querySelector('form')).toBeTruthy();
    expect(div.querySelector('#nameSelect')).toBeTruthy();
    expect(div.querySelector('label[for="nameSelect"]')?.textContent).toMatch(/username/i);
    const submitBtn = div.querySelector('button[type="submit"]');
    expect(submitBtn?.textContent).toMatch(/Register/i);
  });

  it('form submit calls updatePlayer API', async () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <LoginHub />
          </MemoryRouter>
        </Provider>,
      );
    });
    const input = div.querySelector('#nameSelect') as HTMLInputElement;
    act(() => {
      setInputValue(input, 'Bob');
    });
    await act(async () => {
      (div.querySelector('form') as HTMLFormElement).dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/player',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ name: 'Bob' }) }),
    );
  });

  it('shows error when API returns error', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Name taken' }), { status: 409 }),
    );
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <LoginHub />
          </MemoryRouter>
        </Provider>,
      );
    });
    const input = div.querySelector('#nameSelect') as HTMLInputElement;
    act(() => {
      setInputValue(input, 'Taken');
    });
    await act(async () => {
      (div.querySelector('form') as HTMLFormElement).dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });
    expect(div.textContent).toContain('Name taken');
  });

});
