import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import Cell from '../../src/components/Cell';

describe('Cell', () => {
  it('renders with type class', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<Cell type="I" />);
    });
    const cell = div.querySelector('.cell.I');
    expect(cell).toBeTruthy();
  });

  it('renders Empty type', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<Cell type="Empty" />);
    });
    expect(div.querySelector('.cell.Empty')).toBeTruthy();
  });
});
