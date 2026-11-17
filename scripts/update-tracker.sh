#!/usr/bin/env bash
# Refreshes public/v/s.js, the Umami tracker, from the Umami server (after an Umami upgrade).
# The site serves it first-party and posts to /v/e (src/app/v/e/route.ts), so the endpoint is renamed.
# Run on m70q from the repo root: scripts/update-tracker.sh [umami base URL]
set -euo pipefail
base=${1:-http://127.0.0.1:3200}
curl -fsS "$base/script.js" | sed 's#/api/send`#/e`#' > public/v/s.js
grep -q '/e`' public/v/s.js || { echo "endpoint not found in the tracker; check its source" >&2; exit 1; }
echo "public/v/s.js updated ($(wc -c < public/v/s.js) bytes)"
