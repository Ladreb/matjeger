#!/bin/sh
set -e

# Migrations run over the direct (unpooled) connection. Previews get their own Neon branch, so they can never touch production.
prisma() { DATABASE_URL="$DATABASE_URL_UNPOOLED" npx prisma "$@"; }

case "$VERCEL_ENV" in
  production)
    prisma migrate deploy
    ;;
  preview)
    echo "Preview database host: $(echo "$DATABASE_URL_UNPOOLED" | sed -E 's#.*@([^/:?]+).*#\1#')"
    prisma migrate deploy
    ;;
esac

next build
