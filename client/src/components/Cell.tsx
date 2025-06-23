import type React from 'react';
import { Block } from '../globals';

export const Cell: React.FC<{ type: keyof typeof Block }> = ({ type }) => {
  return <div className={`cell ${type}`} />;
};

export default Cell;
