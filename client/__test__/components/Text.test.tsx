import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Text } from '../../src/components/Text';

describe('Text', () => {
  it('renders children with centered style', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<Text>Hello</Text>);
    });
    const el = div.querySelector('div');
    expect(el?.textContent).toBe('Hello');
    expect(el?.style.textAlign).toBe('center');
  });
});
