import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Space, type LucideIcon } from 'lucide-react';
import React from 'react';

const Key: React.FC<{ element: LucideIcon; text: string }> = ({ element, text }) => {
  return (
    <tr style={{ height: '50px' }}>
      <td style={{ paddingRight: '10px' }}>{element && React.createElement(element, { size: 20, color: 'red' })}</td>
      <td style={{ userSelect: 'none' }}>{text}</td>
    </tr>
  );
};

export const Settings = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '10px' }}>Settings</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '30px' }}>
        <table>
          <tbody>
            <Key element={ArrowUp} text="Rotate" />
            <Key element={ArrowDown} text="Move down" />
            <Key element={ArrowLeft} text="Move left" />
            <Key element={ArrowRight} text="Move right" />
            <Key element={Space} text="Hard drop" />
          </tbody>
        </table>
      </div>
    </div>
  );
};
