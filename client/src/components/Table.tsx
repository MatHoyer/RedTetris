import type React from 'react';
import type { PropsWithChildren } from 'react';

export const TableCell: React.FC<PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({
  children,
  ...props
}) => {
  return <div className="styled-table-cell" {...props}>{children}</div>;
};

export const TableLine: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="styled-table-row">{children}</div>;
};

export const Table: React.FC<{ header: string[] } & PropsWithChildren> = ({ header, children }) => {
  return (
    <div className="styled-table" style={{ '--col-count': header.length } as React.CSSProperties}>
      <div className="styled-table-header">
        {header.map((key) => (
          <div className="styled-table-cell" key={key}>{key}</div>
        ))}
      </div>
      <div className="styled-table-body">{children}</div>
    </div>
  );
};
