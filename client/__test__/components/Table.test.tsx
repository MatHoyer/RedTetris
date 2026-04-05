import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Table, TableCell, TableLine } from '../../src/components/Table';

describe('Table', () => {
  it('renders header and body', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <Table header={['A', 'B']}>
          <TableLine>
            <TableCell>1</TableCell>
            <TableCell>2</TableCell>
          </TableLine>
        </Table>,
      );
    });
    const ths = div.querySelectorAll('thead th');
    expect(ths).toHaveLength(2);
    expect(ths[0].textContent).toBe('A');
    expect(ths[1].textContent).toBe('B');
    const tds = div.querySelectorAll('tbody td');
    expect(tds[0].textContent).toBe('1');
    expect(tds[1].textContent).toBe('2');
  });
});
