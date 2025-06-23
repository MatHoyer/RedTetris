import type React from 'react';

export const Text: React.FC<React.ComponentProps<'div'>> = ({ ...props }) => {
  return <div style={{ textAlign: 'center' }} {...props}></div>;
};
