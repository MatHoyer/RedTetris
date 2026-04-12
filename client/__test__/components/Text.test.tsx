import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Text } from '../../src/components/Text';

describe('Text', () => {
  it('renders children with centered style', () => {
    render(<Text>Hello</Text>);
    const el = screen.getByText('Hello');
    expect(el.style.textAlign).toBe('center');
  });
});
