#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
state_dir="${WIKI_WORKER_STATE:-$HOME/.local/state/project-wiki/automation}"
mkdir -p "$state_dir"
chmod 700 "$state_dir"
if [[ "${1:-run}" == status ]]; then
  exec node server/automation/main.js status
fi
exec flock --nonblock "$state_dir/worker.lock" node server/automation/main.js "${1:-run}"
