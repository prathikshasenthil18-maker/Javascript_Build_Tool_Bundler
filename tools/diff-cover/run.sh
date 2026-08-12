#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
npm run test:coverage
mkdir -p reports/diff-cover coverage
if command -v diff-cover >/dev/null 2>&1; then
  diff-cover coverage/lcov.info --html-report coverage/diff-cover.html || true
fi
echo "[tools/diff-cover] done"
