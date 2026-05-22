import type React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../api';

const Key: React.FC<{ symbol: string; text: string }> = ({ symbol, text }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 0', height: '50px' }}>
      <span style={{ color: 'red', fontSize: '20px', minWidth: '40px', textAlign: 'center', userSelect: 'none' }}>
        {symbol}
      </span>
      <span style={{ userSelect: 'none' }}>{text}</span>
    </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Key symbol="↑" text="Rotate" />
          <Key symbol="↓" text="Move down" />
          <Key symbol="←" text="Move left" />
          <Key symbol="→" text="Move right" />
          <Key symbol="SPACE" text="Hard drop" />
        </div>
      </div>
    </div>
  );
};
