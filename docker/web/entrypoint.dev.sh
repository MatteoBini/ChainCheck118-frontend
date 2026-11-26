#!/bin/sh
# Entrypoint di sviluppo del frontend: allinea le dipendenze, poi avvia il comando.
set -e

# node_modules vive in un volume: se package-lock.json è cambiato sull'host, reinstalla.
current_hash="$(sha256sum package-lock.json)"
if [ "$(cat node_modules/.deps-hash 2>/dev/null)" != "$current_hash" ]; then
  echo "[dev] package-lock.json cambiato: npm install..."
  npm install --no-audit --no-fund
  echo "$current_hash" > node_modules/.deps-hash
fi

exec "$@"
