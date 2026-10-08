#!/bin/sh
set -eu
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  npm ci
fi
npm run build:client
if command -v node >/dev/null 2>&1; then
  exec node server.mjs
fi
arena_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ -x "$arena_node" ]; then
  exec "$arena_node" server.mjs
fi
printf '%s\n' 'Install Node.js 22 or later, then run node server.mjs.' >&2
exit 1
