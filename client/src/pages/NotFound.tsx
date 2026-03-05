import { Link, useLocation } from 'react-router-dom';

export const NotFound = () => {
  const url = useLocation();

  return (
    <>
      <h1>Page not found</h1>
      <p
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80%',
        }}
      >
        The page: '{url.pathname}' doesn't exist
      </p>
      <Link
        to="/"
        style={{
          color: 'var(--primary-color)',
          textDecoration: 'none',
          display: 'block',
          textAlign: 'center',
          marginTop: '20px',
        }}
      >
        Go Home
      </Link>
    </>
  );
};
