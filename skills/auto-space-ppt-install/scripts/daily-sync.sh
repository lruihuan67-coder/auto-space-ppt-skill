#!/usr/bin/env bash
# macOS / Linux daily sync entry point. Called by the LaunchAgent.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="${PYTHON:-python3}"
if ! command -v "$PYTHON" >/dev/null 2>&1; then
  echo "Python 3 is required but was not found on PATH." >&2
  exit 1
fi
exec "$PYTHON" "$SCRIPT_DIR/daily-sync.py" "$@"
