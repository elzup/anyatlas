#!/bin/zsh

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Agent Sessions
# @raycast.mode fullOutput
#
# Optional parameters:
# @raycast.packageName Dev Tools
# @raycast.icon 🤖
# @raycast.description Show running Claude/Codex sessions on this Mac
# @raycast.author hiro

set -euo pipefail

if command -v agent-sessions >/dev/null 2>&1; then
  exec agent-sessions
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
repo_script="$script_dir/../bin/agent-sessions"

if [[ -x "$repo_script" ]]; then
  exec "$repo_script"
fi

printf 'agent-sessions not found in PATH.\n'
printf 'Expected either:\n'
printf '  - agent-sessions\n'
printf '  - %s\n' "$repo_script"
exit 1
