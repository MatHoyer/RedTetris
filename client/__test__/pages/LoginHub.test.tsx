import React, { act } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { LoginHub } from '../../src/pages/LoginHub';
import { changeName, store } from '../../src/redux';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

const renderLoginHub = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginHub />
      </MemoryRouter>
    </Provider>,
  );

describe('LoginHub', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    store.dispatch(changeName(''));
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1, name: 'Bob' }), { status: 200 }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders form with username input and Register button', async () => {
    let container: HTMLElement;
    await act(async () => {
      ({ container } = renderLoginHub());
    });
    expect(container!.querySelector('img[alt="Title"]')).toBeTruthy();
    expect(container!.querySelector('form')).toBeTruthy();
    expect(Array.from(container!.querySelectorAll('input')).find((i) => i.id === 'nameSelect')).toBeTruthy();
    expect(container!.querySelector('label[for="nameSelect"]')?.textContent).toMatch(/username/i);
    expect(container!.querySelector('button[type="submit"]')?.textContent).toMatch(/Register/i);
  });

  it('form submit calls updatePlayer API', async () => {
    let container: HTMLElement;
    await act(async () => {
      ({ container } = renderLoginHub());
    });
    const input = Array.from(container!.querySelectorAll('input')).find((i) => i.id === 'nameSelect') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Bob' } });
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
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
    let container: HTMLElement;
    await act(async () => {
      ({ container } = renderLoginHub());
    });
    const input = Array.from(container!.querySelectorAll('input')).find((i) => i.id === 'nameSelect') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Taken' } });
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Name taken');
    });
  });
});
