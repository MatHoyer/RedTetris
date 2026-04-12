import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CreateGame } from '../../src/pages/CreateGame';
import { store } from '../../src/redux';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

const renderCreateGame = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CreateGame />
      </MemoryRouter>
    </Provider>,
  );

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
    const { container } = renderCreateGame();
    const backLink = container.querySelector('a[href="/online"]');
    expect(backLink?.textContent).toMatch(/Back/i);
    expect(container.querySelector('#roomName')).toBeTruthy();
    expect(container.querySelector('label[for="roomName"]')?.textContent).toMatch(/Room name/i);
    expect(container.querySelector('#number')).toBeTruthy();
    expect(screen.getByText(/Create/i)).toBeTruthy();
  });

  it('submit with empty roomName does not call API', async () => {
    let container: HTMLElement;
    await act(async () => {
      ({ container } = renderCreateGame());
    });
    fetchSpy.mockClear();
    fireEvent.submit(container!.querySelector('form')!);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('submit with roomName and maxPlayers calls createGame API', async () => {
    let container: HTMLElement;
    await act(async () => {
      ({ container } = renderCreateGame());
    });
    const inputs = container!.querySelectorAll('input');
    const roomInput = Array.from(inputs).find((i) => i.id === 'roomName') as HTMLInputElement;
    const rangeInput = Array.from(inputs).find((i) => i.id === 'number') as HTMLInputElement;
    fireEvent.change(roomInput, { target: { value: ' my-room ' } });
    fireEvent.change(rangeInput, { target: { value: '4', valueAsNumber: 4 } });
    fetchSpy.mockClear();
    fireEvent.submit(container!.querySelector('form')!);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/games',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ roomName: 'my-room', maxPlayers: 4, modes: [] }),
        }),
      );
    });
  });
});
