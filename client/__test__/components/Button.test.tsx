import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Button } from '../../src/components/Button';

describe('Button', () => {
  it('renders children', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<Button>Click me</Button>);
    });
    expect(div.querySelector('button')?.textContent).toBe('Click me');
  });
});
