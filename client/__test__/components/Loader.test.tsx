import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { AppLoader } from '../../src/components/Loader';

describe('AppLoader', () => {
  it('renders with spin class', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<AppLoader />);
    });
    expect(div.querySelector('.animate-spin')).toBeTruthy();
  });
});
