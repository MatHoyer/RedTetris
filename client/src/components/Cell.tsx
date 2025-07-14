import type React from 'react';
import type { TCell } from '../globals';

export const Cell: React.FC<{ type: TCell }> = ({ type }) => {
  return <div className={`cell ${type}`} />;
};

export default Cell;
