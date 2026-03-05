import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Events } from '../../../events';
import { CreateGame } from '../../src/pages/CreateGame';
import socket from '../../src/socket';

vi.mock('../../src/socket', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('CreateGame', () => {
  it('renders Back link, room name input, max players range and Create button', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <MemoryRouter>
          <CreateGame />
        </MemoryRouter>,
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

  it('submit with empty roomName does not emit NEW_GAME', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <MemoryRouter>
          <CreateGame />
        </MemoryRouter>,
      );
    });
    const form = div.querySelector('form');
    act(() => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(vi.mocked(socket.emit)).not.toHaveBeenCalledWith(Events.NEW_GAME, expect.anything());
  });

  it('submit with roomName and maxPlayers emits NEW_GAME', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <MemoryRouter>
          <CreateGame />
        </MemoryRouter>,
      );
    });
    const roomInput = div.querySelector('#roomName') as HTMLInputElement;
    const rangeInput = div.querySelector('#number') as HTMLInputElement;
    const setInputValue = (el: HTMLInputElement, value: string) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    act(() => {
      setInputValue(roomInput, ' my-room ');
    });
    act(() => {
      setInputValue(rangeInput, '4');
    });
    act(() => {
      (div.querySelector('form') as HTMLFormElement).dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.NEW_GAME, {
      roomName: 'my-room',
      maxPlayers: 4,
    });
  });
});
