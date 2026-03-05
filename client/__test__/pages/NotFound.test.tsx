import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { NotFound } from '../../src/pages/NotFound';

function renderNotFound(initialPath: string) {
  const div = document.createElement('div');
  const root = createRoot(div);
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  return div;
}

describe('NotFound', () => {
  it('shows page not found and path', () => {
    const div = renderNotFound('/foo/bar');
    expect(div.querySelector('h1')?.textContent).toBe('Page not found');
    expect(div.textContent).toContain("/foo/bar");
  });

  it('has link to home', () => {
    const div = renderNotFound('/nope');
    const link = div.querySelector('a[href="/"]');
    expect(link?.textContent).toMatch(/go home/i);
  });
});
