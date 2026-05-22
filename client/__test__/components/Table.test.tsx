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
    const headerCells = container.querySelectorAll('.styled-table-header .styled-table-cell');
    expect(headerCells).toHaveLength(2);
    expect(headerCells[0].textContent).toBe('A');
    expect(headerCells[1].textContent).toBe('B');
    const bodyCells = container.querySelectorAll('.styled-table-row .styled-table-cell');
    expect(bodyCells[0].textContent).toBe('1');
    expect(bodyCells[1].textContent).toBe('2');
  });
});
