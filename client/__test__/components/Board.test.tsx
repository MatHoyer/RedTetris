import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { store } from '../../src/redux';
import Board from '../../src/components/Board';

describe('Board', () => {
  it('renders 20 rows and 10 cells per row', () => {
    const { container } = render(
      <Provider store={store}>
        <Board />
      </Provider>,
    );
    const rows = container.querySelectorAll('.board .row');
    expect(rows).toHaveLength(20);
    rows.forEach((row) => {
      expect(row.querySelectorAll('.cell')).toHaveLength(10);
    });
  });
});
