#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usa: $0 <ruta-de-carpeta>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$SCRIPT_DIR/.env" ]; then
  export $(grep -v '^\s*#' "$SCRIPT_DIR/.env" | xargs)
fi

node "$SCRIPT_DIR/upload-cloudinary.js" "$1"
