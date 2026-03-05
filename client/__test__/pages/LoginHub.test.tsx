import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { Events } from '../../../events';
import { LoginHub } from '../../src/pages/LoginHub';
import socket from '../../src/socket';

vi.mock('../../src/socket', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('LoginHub', () => {
  it('renders form with username input and Register button', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<LoginHub />);
    });
    expect(div.querySelector('img[alt="Title"]')).toBeTruthy();
    expect(div.querySelector('form')).toBeTruthy();
    expect(div.querySelector('#nameSelect')).toBeTruthy();
    expect(div.querySelector('label[for="nameSelect"]')?.textContent).toMatch(/username/i);
    const submitBtn = div.querySelector('button[type="submit"]');
    expect(submitBtn?.textContent).toMatch(/Register/i);
  });

  it('form submit emits UPDATE_PLAYER with name', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<LoginHub />);
    });
    const input = div.querySelector('#nameSelect') as HTMLInputElement;
    const setInputValue = (el: HTMLInputElement, value: string) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    act(() => {
      setInputValue(input, 'Bob');
    });
    act(() => {
      (div.querySelector('form') as HTMLFormElement).dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.UPDATE_PLAYER, { name: 'Bob' });
  });

  it('shows error when socket fires UPDATE_PLAYER_ERROR', () => {
    let errorCb: (data: { message: string }) => void = () => {};
    vi.mocked(socket.on).mockImplementation((ev: string, listener: (...args: unknown[]) => void) => {
      if (ev === Events.UPDATE_PLAYER_ERROR) errorCb = listener as (data: { message: string }) => void;
      return socket as ReturnType<typeof socket.on>;
    });
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<LoginHub />);
    });
    expect(div.querySelector('p[style*="red"]')).toBeFalsy();
    act(() => {
      errorCb({ message: 'Name taken' });
    });
    expect(div.textContent).toContain('Name taken');
  });

  it('unmount calls socket.off for UPDATE_PLAYER_ERROR', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<LoginHub />);
    });
    act(() => {
      root.unmount();
    });
    expect(vi.mocked(socket.off)).toHaveBeenCalledWith(Events.UPDATE_PLAYER_ERROR);
  });

  it('Register button onClick emits UPDATE_PLAYER', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<LoginHub />);
    });
    const setInputValue = (el: HTMLInputElement, value: string) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    act(() => {
      setInputValue(div.querySelector('#nameSelect') as HTMLInputElement, 'Charlie');
    });
    vi.mocked(socket.emit).mockClear();
    const registerBtn = div.querySelector('button[type="submit"]');
    act(() => {
      registerBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.UPDATE_PLAYER, { name: 'Charlie' });
  });
});
