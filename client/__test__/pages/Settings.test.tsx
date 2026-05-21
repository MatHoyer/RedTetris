import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Settings } from '../../src/pages/Settings';

describe('Settings', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('renders Settings heading', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders key bindings table', () => {
    const { container } = render(<Settings />);
    expect(container.querySelector('table')).toBeTruthy();
    expect(container.textContent).toMatch(/Rotate|Move down|Move left|Move right|Hard drop/i);
  });

  it('displays version from /api/version', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ version: 'v1.2.3' }),
      }),
    );
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('v1.2.3')).toBeTruthy();
    });
  });
});
