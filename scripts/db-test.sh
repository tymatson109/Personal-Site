#!/usr/bin/env bash
# Applies every migration in order, then the database checks, to the empty database at $DATABASE_URL.
# Connect as a non-superuser owner, like Neon's neondb_owner, so the checks see the same rules production does.
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to an empty Postgres database}"
cd "$(dirname "$0")/.."
# Query results are discarded; each check reports through a notice and fails by raising
run() { psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -o /dev/null -f "$1"; }
for migration in db/migrations/*.sql; do
  echo "Applying $migration"
  run "$migration"
done
run db/tests/rls.sql
echo "Database checks passed"
