#!/usr/bin/env bash
# One-command setup for macOS, Linux and Git Bash. Safe to run more than once.
set -euo pipefail
cd "$(dirname "$0")"
ROOT=$(pwd)

step() { printf '\n==> %s\n' "$1"; }
need() {
  command -v "$1" >/dev/null 2>&1 || { printf "Missing '%s'. %s\n" "$1" "$2" >&2; exit 1; }
}
env_val() { grep -E "^$1=" "$ROOT/backend/.env" | head -1 | cut -d= -f2- | tr -d '\r"' ; }

step "Checking tools"
need php "Install PHP 8.3+ (Windows: Laragon, then add its php folder to PATH)."
need composer "Install Composer 2 (Windows: it ships with Laragon)."
need node "Install Node.js 20+."
need npm "Install Node.js 20+."
php -r 'exit(PHP_VERSION_ID >= 80300 ? 0 : 1);' || { echo "PHP 8.3+ is required, found $(php -r 'echo PHP_VERSION;')." >&2; exit 1; }

step "Backend: installing PHP packages"
cd backend
composer install --no-interaction
[ -f .env ] || cp .env.example .env
# Keep an existing key: regenerating it would log everyone out.
grep -qE '^APP_KEY=.+' .env || php artisan key:generate --ansi

step "Backend: creating the database"
DB_NAME=$(env_val DB_DATABASE)
if command -v mysql >/dev/null 2>&1; then
  if MYSQL_PWD=$(env_val DB_PASSWORD) mysql -h"$(env_val DB_HOST)" -P"$(env_val DB_PORT)" -u"$(env_val DB_USERNAME)" \
      -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4" 2>/dev/null; then
    echo "Database '$DB_NAME' is ready."
  else
    echo "Could not create '$DB_NAME' (is MySQL running? are the DB_* values in backend/.env right?)."
    echo "Create it yourself and re-run this script. Continuing in case it already exists."
  fi
else
  echo "The 'mysql' command is not in PATH. Create an empty database named '$DB_NAME' yourself"
  echo "(Laragon: HeidiSQL). Continuing in case it already exists."
fi

step "Backend: migrating and seeding"
php artisan migrate --force --no-interaction || {
  echo "Migration failed. Check that MySQL is running and the database exists." >&2
  echo "More help: docs/SETUP.md" >&2
  exit 1
}
php artisan db:seed --force --no-interaction
cd ..

step "Frontend: installing packages"
cd frontend
npm install
[ -f .env.local ] || cp .env.example .env.local
cd ..

cat <<'EOF'

Setup finished.

Start the app in two terminals:
  1) cd backend  && php artisan serve    # http://localhost:8000
  2) cd frontend && npm run dev          # http://localhost:3000

Demo recruiter: recruiter@example.com / password

Optional, for the end-to-end tests (about 120 MB, one time):
  cd frontend && npx playwright install chromium
EOF
