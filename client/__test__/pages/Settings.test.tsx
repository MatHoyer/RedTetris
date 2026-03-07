import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Settings } from '../../src/pages/Settings';

describe('Settings', () => {
  it('renders Settings heading', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<Settings />);
    });
    expect(div.querySelector('h1')?.textContent).toBe('Settings');
  });

  it('renders key bindings table', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<Settings />);
    });
    const table = div.querySelector('table');
    expect(table).toBeTruthy();
    expect(div.textContent).toMatch(/Rotate|Move down|Move left|Move right|Hard drop/i);
  });
});
