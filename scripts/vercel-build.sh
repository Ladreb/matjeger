#!/bin/sh
set -e

# Migrations run over the direct (unpooled) connection. Previews get their own Neon branch, so they can never touch production.
prisma() { DATABASE_URL="$DATABASE_URL_UNPOOLED" npx prisma "$@"; }

case "$VERCEL_ENV" in
  production)
    prisma migrate deploy
    ;;
  preview)
    host=$(echo "$DATABASE_URL_UNPOOLED" | sed -E 's#.*@([^/:?]+).*#\1#')
    # Vercel hides the host in build logs, so check it here: a preview must never run migrations on production.
    case "$host" in
      ep-long-bird*)
        echo "Preview build stopped: it points at the production database."
        exit 1
        ;;
    esac
    prisma migrate deploy
    ;;
esac

next build
