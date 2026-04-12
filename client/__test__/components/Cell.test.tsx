import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Cell from '../../src/components/Cell';

describe('Cell', () => {
  it('renders with type class', () => {
    const { container } = render(<Cell type="I" />);
    expect(container.querySelector('.cell.I')).toBeTruthy();
  });

  it('renders Empty type', () => {
    const { container } = render(<Cell type="Empty" />);
    expect(container.querySelector('.cell.Empty')).toBeTruthy();
  });
});
