import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Space, type LucideIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../api';

const Key: React.FC<{ element: LucideIcon; text: string }> = ({ element, text }) => {
  return (
    <tr style={{ height: '50px' }}>
      <td style={{ paddingRight: '10px' }}>{element && React.createElement(element, { size: 20, color: 'red' })}</td>
      <td style={{ userSelect: 'none' }}>{text}</td>
    </tr>
  );
};

export const Settings = () => {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    api
      .getVersion()
      .then((res) => res.json())
      .then((data: { version?: string }) => setVersion(data.version ?? null))
      .catch(() => setVersion(null));
  }, []);

  return (
    <div>
      {version && (
        <p style={{ marginTop: 16, fontSize: 11, color: '#6b7280', textAlign: 'center', userSelect: 'none' }}>
          {version}
        </p>
      )}
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
