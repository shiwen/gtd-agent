#!/usr/bin/env bash

set -euo pipefail

MODE="${1:-dev}"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found in PATH." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Using existing node_modules. Run 'npm install' manually if dependencies changed."
fi

case "$MODE" in
  dev)
    echo "Starting Next.js dev server on http://localhost:3000 ..."
    npm run dev
    ;;
  prod|production)
    echo "Building optimized production bundle..."
    npm run build
    echo "Starting production server on http://localhost:3000 ..."
    npm run start
    ;;
  *)
    echo "Unknown mode: $MODE" >&2
    echo "Usage: $0 [dev|prod]" >&2
    exit 1
    ;;
esac
