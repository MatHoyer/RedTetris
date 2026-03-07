import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { useToggle } from '../../src/hooks/useToggle';

function TestComponent({
  initial,
  onRender,
}: {
  initial: boolean;
  onRender: (toggle: boolean, setToggle: () => void) => void;
}) {
  const { toggle, setToggle } = useToggle(initial);
  onRender(toggle, setToggle);
  return <span data-toggle={String(toggle)} />;
}

describe('useToggle', () => {
  it('starts with initial value true', () => {
    let toggle = false;
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <TestComponent
          initial={true}
          onRender={(t, _s) => {
            toggle = t;
          }}
        />,
      );
    });
    expect(toggle).toBe(true);
    expect(div.querySelector('[data-toggle="true"]')).toBeTruthy();
  });

  it('starts with initial value false', () => {
    let toggle = true;
    act(() => {
      const div = document.createElement('div');
      const root = createRoot(div);
      root.render(
        <TestComponent
          initial={false}
          onRender={(t, _s) => {
            toggle = t;
          }}
        />,
      );
    });
    expect(toggle).toBe(false);
  });

  it('flips when setToggle is called', () => {
    let toggle = false;
    let setToggle: () => void = () => {};
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(
        <TestComponent
          initial={false}
          onRender={(t, s) => {
            toggle = t;
            setToggle = s;
          }}
        />,
      );
    });
    expect(toggle).toBe(false);
    act(() => {
      setToggle();
    });
    expect(div.querySelector('[data-toggle="true"]')).toBeTruthy();
  });
});
