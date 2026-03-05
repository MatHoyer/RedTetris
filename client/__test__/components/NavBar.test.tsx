import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Events } from '../../../events';
import { Navbar } from '../../src/components/NavBar';
import socket from '../../src/socket';

vi.mock('../../src/socket', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('Navbar', () => {
  it('renders nav with logo link and settings icon', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
      );
    });
    expect(div.querySelector('nav')).toBeTruthy();
    const logoLink = div.querySelector('a[href="/"]');
    expect(logoLink).toBeTruthy();
    expect(div.querySelector('img[alt="logo"]')).toBeTruthy();
    expect(div.querySelector('.icon')).toBeTruthy();
    expect(div.querySelector('h1')).toBeFalsy(); // Settings not open
  });

  it('clicking logo link emits LEAVE_GAMES', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
      );
    });
    const logoLink = div.querySelector('a[href="/"]');
    act(() => {
      logoLink?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(vi.mocked(socket.emit)).toHaveBeenCalledWith(Events.LEAVE_GAMES);
  });

  it('opens settings modal when cog is clicked', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
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
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
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
