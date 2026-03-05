import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import {
  InputCheckbox,
  InputRange,
  InputText,
} from '../../src/components/Inputs';

describe('InputCheckbox', () => {
  it('renders label and checkbox', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<InputCheckbox id="cb" label="Check me" />);
    });
    const input = div.querySelector('#cb');
    const label = div.querySelector('label[for="cb"]');
    expect(input?.getAttribute('type')).toBe('checkbox');
    expect(label?.textContent).toBe('Check me');
  });
});

describe('InputRange', () => {
  it('renders label and range input', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<InputRange id="r" label="Volume" min={0} max={100} />);
    });
    const input = div.querySelector('#r');
    expect(input?.getAttribute('type')).toBe('range');
    expect(input?.getAttribute('min')).toBe('0');
    expect(input?.getAttribute('max')).toBe('100');
    expect(div.querySelector('label[for="r"]')?.textContent).toBe('Volume');
  });
});

describe('InputText', () => {
  it('renders label and text input', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    act(() => {
      root.render(<InputText id="t" label="Name" />);
    });
    const input = div.querySelector('#t');
    expect(input?.getAttribute('type')).toBe('text');
    expect(div.querySelector('label[for="t"]')?.textContent).toBe('Name');
  });
});
