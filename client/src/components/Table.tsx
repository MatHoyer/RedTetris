import type React from 'react';
import type { PropsWithChildren } from 'react';

export const TableCell: React.FC<PropsWithChildren> = ({ children }) => {
  return <td>{children}</td>;
};

export const TableLine: React.FC<PropsWithChildren> = ({ children }) => {
  return <tr>{children}</tr>;
};

export const Table: React.FC<{ header: string[] } & PropsWithChildren> = ({ header, children }) => {
  return (
    <table className="styled-table">
      <thead>
        <tr>
          {header.map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};
