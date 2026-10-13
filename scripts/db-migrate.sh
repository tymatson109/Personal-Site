#!/usr/bin/env bash
# Applies every migration in order to the empty database at $DATABASE_URL.
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to an empty Postgres database}"
cd "$(dirname "$0")/.."
for migration in db/migrations/*.sql; do
  echo "Applying $migration"
  psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -o /dev/null -f "$migration"
done
