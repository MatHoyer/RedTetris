import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { store, changeName } from '../../src/redux';
import { Pages } from '../../src/pages/Pages';

vi.mock('../../src/socket', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('Pages', () => {
  it('renders LoginHub at /login-hub', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/login-hub']}>
            <Pages />
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('#nameSelect')).toBeTruthy();
    expect(div.textContent).toMatch(/Register|username/i);
  });

  it('redirects to LoginHub at / when user has no name', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeName(''));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Pages />
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('#nameSelect')).toBeTruthy();
  });

  it('renders Home at / when user has name', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      store.dispatch(changeName('Alice'));
    });
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Pages />
          </MemoryRouter>
        </Provider>,
      );
    });
    expect(div.querySelector('img[alt="Title"]')).toBeTruthy();
    expect(div.textContent).toMatch(/Solo|Online/);
  });
});
