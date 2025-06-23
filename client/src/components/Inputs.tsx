import type React from 'react';

export const InputCheckbox: React.FC<{ id: string; label: string } & React.ComponentProps<'input'>> = ({
  id,
  label,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        gap: 2,
      }}
    >
      <input
        type="checkbox"
        id={id}
        defaultChecked
        style={{
          marginRight: '10px',
          color: 'var(--primary-color)',
        }}
      />
      <label htmlFor={id} style={{ color: 'white', textAlign: 'center' }}>
        {label}
      </label>
    </div>
  );
};

export const InputRange: React.FC<
  { id: string; label: string; min: number; max: number } & React.ComponentProps<'input'>
> = ({ id, label, min, max, ...rest }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label htmlFor={id}>{label}</label>
      <input type="range" id={id} className="form-control" min={min} max={max} {...rest} />
    </div>
  );
};

export const InputText: React.FC<{ id: string; label: string } & React.ComponentProps<'input'>> = ({
  id,
  label,
  ...rest
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label htmlFor={id}>{label}</label>
      <input
        type="text"
        id={id}
        style={{
          padding: '5px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: '#333',
          color: 'white',
        }}
        {...rest}
      />
    </div>
  );
};
