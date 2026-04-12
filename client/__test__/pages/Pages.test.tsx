import React, { act } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { store, changeName } from '../../src/redux';
import { Pages } from '../../src/pages/Pages';

vi.mock('../../src/socket', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('Pages', () => {
  beforeEach(() => {
    store.dispatch(changeName(''));
  });

  it('renders LoginHub at /login-hub', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login-hub']}>
          <Pages />
        </MemoryRouter>
      </Provider>,
    );
    expect(Array.from(container.querySelectorAll('input')).find((i) => i.id === 'nameSelect')).toBeTruthy();
    expect(container.textContent).toMatch(/Register|username/i);
  });

  it('redirects to LoginHub at / when user has no name', async () => {
    store.dispatch(changeName(''));
    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Pages />
          </MemoryRouter>
        </Provider>,
      ));
    });
    expect(Array.from(container!.querySelectorAll('input')).find((i) => i.id === 'nameSelect')).toBeTruthy();
  });

  it('renders Home at / when user has name', () => {
    store.dispatch(changeName('Alice'));
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Pages />
        </MemoryRouter>
      </Provider>,
    );
    expect(container.querySelector('img[alt="Title"]')).toBeTruthy();
    expect(container.textContent).toMatch(/Solo|Online/);
  });
});
