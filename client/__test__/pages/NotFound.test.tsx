import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { NotFound } from '../../src/pages/NotFound';

const renderNotFound = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>,
  );

describe('NotFound', () => {
  it('shows page not found and path', () => {
    const { container } = renderNotFound('/foo/bar');
    expect(screen.getByText('Page not found')).toBeTruthy();
    expect(container.textContent).toContain('/foo/bar');
  });

  it('has link to home', () => {
    const { container } = renderNotFound('/nope');
    const link = container.querySelector('a[href="/"]');
    expect(link?.textContent).toMatch(/go home/i);
  });
});
