import type React from 'react';

export const Button: React.FC<React.ComponentProps<'button'>> = ({ ...props }) => {
  return <button className="btn" {...props}></button>;
};
