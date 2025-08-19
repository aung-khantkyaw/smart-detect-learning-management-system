#!/usr/bin/env sh
set -euo pipefail

# Restore the most recent backup into the running 'db' container.
# Usage: ./scripts/restore_latest.sh [db_container_name]

DB_CONTAINER="${1:-sdlms-postgres}"
LATEST_FILE=$(ls -t ./backups/*.sql.gz 2>/dev/null | head -n1 || true)

if [ -z "$LATEST_FILE" ]; then
  echo "No backup files found in ./backups" >&2
  exit 1
fi

echo "Restoring $LATEST_FILE into container $DB_CONTAINER..."
cat "$LATEST_FILE" | gzip -d | docker exec -i "$DB_CONTAINER" psql -U sdlms -d sdlms

echo "Restore complete."
