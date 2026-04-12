import React, { act } from 'react';
import { render } from '@testing-library/react';
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
    const { container } = render(
      <TestComponent
        initial={true}
        onRender={(t) => {
          toggle = t;
        }}
      />,
    );
    expect(toggle).toBe(true);
    expect(container.querySelector('[data-toggle="true"]')).toBeTruthy();
  });

  it('starts with initial value false', () => {
    let toggle = true;
    render(
      <TestComponent
        initial={false}
        onRender={(t) => {
          toggle = t;
        }}
      />,
    );
    expect(toggle).toBe(false);
  });

  it('flips when setToggle is called', () => {
    let toggle = false;
    let setToggle: () => void = () => {};
    const { container } = render(
      <TestComponent
        initial={false}
        onRender={(t, s) => {
          toggle = t;
          setToggle = s;
        }}
      />,
    );
    expect(toggle).toBe(false);
    act(() => {
      setToggle();
    });
    expect(container.querySelector('[data-toggle="true"]')).toBeTruthy();
  });
});
