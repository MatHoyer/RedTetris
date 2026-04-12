import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Table, TableCell, TableLine } from '../../src/components/Table';

describe('Table', () => {
  it('renders header and body', () => {
    const { container } = render(
      <Table header={['A', 'B']}>
        <TableLine>
          <TableCell>1</TableCell>
          <TableCell>2</TableCell>
        </TableLine>
      </Table>,
    );
    const ths = container.querySelectorAll('thead th');
    expect(ths).toHaveLength(2);
    expect(ths[0].textContent).toBe('A');
    expect(ths[1].textContent).toBe('B');
    const tds = container.querySelectorAll('tbody td');
    expect(tds[0].textContent).toBe('1');
    expect(tds[1].textContent).toBe('2');
  });
});
