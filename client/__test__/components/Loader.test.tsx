import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppLoader } from '../../src/components/Loader';

describe('AppLoader', () => {
  it('renders with spin class', () => {
    const { container } = render(<AppLoader />);
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });
});
