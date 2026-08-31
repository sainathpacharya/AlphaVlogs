#!/usr/bin/env bash
# Install iOS pods from the committed Podfile.lock.
# Do not pass --repo-update: that re-resolves every CocoaPods version from the
# CDN. jsDelivr currently 400s some specs (GoogleAppMeasurement 12.9.0) even
# when the lockfile already pins a working version (12.15.0).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/ios"

export COCOAPODS_DISABLE_STATS=true

max_attempts=3
for attempt in $(seq 1 "$max_attempts"); do
  echo "pod install --deployment (attempt ${attempt}/${max_attempts})"
  if pod install --deployment; then
    exit 0
  fi
  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "pod install failed after ${max_attempts} attempts"
    exit 1
  fi
  echo "Retrying after clearing CocoaPods CDN cache..."
  rm -rf "${HOME}/.cocoapods/repos/trunk"
  sleep $((attempt * 10))
done
