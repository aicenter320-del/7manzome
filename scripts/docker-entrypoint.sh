#!/bin/sh
set -e

mkdir -p /app/data /app/storage /app/backups

if [ "$(id -u)" = "0" ]; then
  chown -R haft:haft /app/data /app/storage /app/backups 2>/dev/null || true
  if command -v setpriv >/dev/null 2>&1; then
    exec setpriv --reuid=haft --regid=haft --init-groups -- "$0" "$@"
  fi
fi

echo "DATABASE_URL=${DATABASE_URL:-unset}"
if [ ! -f /app/data/haft.db ]; then
  echo "WARNING: /app/data/haft.db is missing. Seed will create a new database."
  echo "If users already existed, persist ./data on the host (do not recreate the container without that folder)."
fi

exec "$@"
