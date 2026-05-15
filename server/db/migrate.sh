#!/bin/sh
set -eu

PGHOST="${PGHOST:-postgres}"
PGUSER="${PGUSER:-redtetris}"
PGPASSWORD="${PGPASSWORD:-redtetris}"
PGDATABASE="${PGDATABASE:-redtetris}"
export PGPASSWORD

until pg_isready -h "$PGHOST" -U "$PGUSER" -d postgres >/dev/null 2>&1; do
  echo "Waiting for postgres..."
  sleep 1
done

echo "Terminating connections to ${PGDATABASE}..."
psql -h "$PGHOST" -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 <<EOSQL
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '${PGDATABASE}' AND pid <> pg_backend_pid();
EOSQL

echo "Dropping database ${PGDATABASE}..."
psql -h "$PGHOST" -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 \
  -c "DROP DATABASE IF EXISTS \"${PGDATABASE}\";"

echo "Creating database ${PGDATABASE}..."
psql -h "$PGHOST" -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 \
  -c "CREATE DATABASE \"${PGDATABASE}\" OWNER \"${PGUSER}\";"

echo "Running init.sql..."
psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f /init.sql

echo "Migration complete."
