import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InputCheckbox, InputRange, InputText } from '../../src/components/Inputs';

describe('InputCheckbox', () => {
  it('renders label and checkbox', () => {
    const { container } = render(<InputCheckbox id="cb" label="Check me" />);
    const input = container.querySelector('#cb');
    const label = container.querySelector('label[for="cb"]');
    expect(input?.getAttribute('type')).toBe('checkbox');
    expect(label?.textContent).toBe('Check me');
  });
});

describe('InputRange', () => {
  it('renders label and range input', () => {
    const { container } = render(<InputRange id="r" label="Volume" min={0} max={100} />);
    const input = container.querySelector('#r');
    expect(input?.getAttribute('type')).toBe('range');
    expect(input?.getAttribute('min')).toBe('0');
    expect(input?.getAttribute('max')).toBe('100');
    expect(container.querySelector('label[for="r"]')?.textContent).toBe('Volume');
  });
});

describe('InputText', () => {
  it('renders label and text input', () => {
    const { container } = render(<InputText id="t" label="Name" />);
    const input = container.querySelector('#t');
    expect(input?.getAttribute('type')).toBe('text');
    expect(container.querySelector('label[for="t"]')?.textContent).toBe('Name');
  });
});
