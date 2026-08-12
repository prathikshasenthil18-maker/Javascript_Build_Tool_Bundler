#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
echo "[tools/eslint-plugin-sonarjs] npm run lint:sonarjs"
npm run lint:sonarjs
