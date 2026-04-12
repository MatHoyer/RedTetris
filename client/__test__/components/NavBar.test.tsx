import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Navbar } from '../../src/components/NavBar';
import { store } from '../../src/redux';

vi.mock('../../src/socket', () => ({
  default: { id: 'test-socket', emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

const renderNavbar = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </Provider>,
  );

describe('Navbar', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true })));
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders nav with logo link and settings icon', () => {
    renderNavbar();
    expect(screen.getByAltText('logo')).toBeTruthy();
    expect(document.querySelector('.icon')).toBeTruthy();
  });

  it('clicking logo link calls leaveAll API', async () => {
    renderNavbar();
    const logoLink = document.querySelector('a[href="/"]');
    fireEvent.click(logoLink!);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/games/leave-all', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('opens settings modal when cog is clicked', () => {
    renderNavbar();
    const cog = document.querySelector('.icon')!;
    fireEvent.click(cog);
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Close')).toBeTruthy();
  });

  it('closes modal when Close button is clicked', () => {
    renderNavbar();
    const cog = document.querySelector('.icon')!;
    fireEvent.click(cog);
    expect(screen.getByText('Settings')).toBeTruthy();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText('Settings')).toBeFalsy();
  });
});
