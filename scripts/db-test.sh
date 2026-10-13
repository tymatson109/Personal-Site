#!/usr/bin/env bash
# Applies every migration, then the database checks, to the empty database at $DATABASE_URL.
# Connect as a non-superuser owner, like Neon's neondb_owner, so the checks see the same rules production does.
set -euo pipefail
cd "$(dirname "$0")/.."
scripts/db-migrate.sh
# Query results are discarded; each check reports through a notice and fails by raising
psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -o /dev/null -f db/tests/rls.sql
echo "Database checks passed"
