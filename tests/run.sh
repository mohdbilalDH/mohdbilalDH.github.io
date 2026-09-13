#!/usr/bin/env bash
# Build, serve dist/ on :4321, run one or all e2e scripts. Usage: tests/run.sh [test_name.py]
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build >/dev/null
PY=tests/.venv/bin/python
HELPER="$HOME/.claude/skills/webapp-testing/scripts/with_server.py"
if [ $# -gt 0 ]; then SCRIPTS=("tests/e2e/$1"); else SCRIPTS=(tests/e2e/test_*.py); fi
for s in "${SCRIPTS[@]}"; do
  echo "== $s"
  $PY "$HELPER" --server "npx astro preview --host 127.0.0.1 --port 4321" --port 4321 -- $PY "$s"
done
echo "ALL PASSED"
