#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "Instalá Node.js 22 o más nuevo: https://nodejs.org"
  exit 1
fi

major="$(node -p "process.versions.node.split('.')[0]")"
if [ "$major" -lt 22 ]; then
  echo "Hace falta Node.js 22 o más nuevo. Ahora tenés $(node -v)."
  exit 1
fi

npm install
echo ""
echo "Campus en http://localhost:8080"
echo "Para entrar como CEO, creá la cuenta con direccion.sif@gmail.com"
npm run dev
