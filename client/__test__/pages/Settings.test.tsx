import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Settings } from '../../src/pages/Settings';

describe('Settings', () => {
  it('renders Settings heading', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders key bindings table', () => {
    const { container } = render(<Settings />);
    expect(container.querySelector('table')).toBeTruthy();
    expect(container.textContent).toMatch(/Rotate|Move down|Move left|Move right|Hard drop/i);
  });
});
