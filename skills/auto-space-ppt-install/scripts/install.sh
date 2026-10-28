#!/usr/bin/env bash
# macOS / Linux installer entry point. All logic lives in install.py.
# Usage: ./install.sh --with-agent --with-schedule --schedule 09:10
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="${PYTHON:-python3}"
if ! command -v "$PYTHON" >/dev/null 2>&1; then
  echo "Python 3 is required but was not found on PATH." >&2
  exit 1
fi
exec "$PYTHON" "$SCRIPT_DIR/install.py" "$@"
