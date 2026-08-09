#!/bin/sh
set -e

echo "==> Running Prisma Database Setup..."
npx prisma db push --skip-generate

if [ "$SEED_DB_ON_STARTUP" = "true" ]; then
  echo "==> Checking if initial seed data is needed..."
  npx prisma db seed || true
fi

echo "==> Starting Next.js TodoList Server on port ${PORT:-8001}..."
exec "$@"
