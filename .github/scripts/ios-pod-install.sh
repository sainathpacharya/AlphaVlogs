#!/usr/bin/env bash
# Install iOS pods from the committed Podfile.lock.
# jsDelivr (CocoaPods CDN) currently 400s some specs, including
# GoogleAppMeasurement 12.9.0. Pre-seed those files from GitHub Specs so
# CocoaPods does not have to download them from the CDN.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/ios"

export COCOAPODS_DISABLE_STATS=true

TRUNK="${HOME}/.cocoapods/repos/trunk"
GITHUB_SPECS="https://raw.githubusercontent.com/CocoaPods/Specs/master"

seed_spec() {
  local rel="$1"
  local dest="${TRUNK}/${rel}"
  mkdir -p "$(dirname "$dest")"
  echo "Seeding CocoaPods spec from GitHub: ${rel}"
  curl -fsSL "${GITHUB_SPECS}/${rel}" -o "${dest}"
}

seed_known_broken_specs() {
  mkdir -p "${TRUNK}"
  if [ ! -f "${TRUNK}/.url" ]; then
    echo "https://cdn.cocoapods.org/" > "${TRUNK}/.url"
  fi
  seed_spec "Specs/e/3/b/GoogleAppMeasurement/12.9.0/GoogleAppMeasurement.podspec.json"
  seed_spec "Specs/e/3/b/GoogleAppMeasurement/12.15.0/GoogleAppMeasurement.podspec.json"
}

seed_from_install_log() {
  local log="$1"
  local urls
  urls="$(grep -oE 'https://cdn.jsdelivr.net/cocoa/Specs/[^ ]+\.podspec\.json' "$log" || true)"
  if [ -z "$urls" ]; then
    return 1
  fi
  local seeded=0
  while IFS= read -r url; do
    [ -z "$url" ] && continue
    seed_spec "${url#https://cdn.jsdelivr.net/cocoa/}"
    seeded=1
  done <<< "$urls"
  [ "$seeded" -eq 1 ]
}

run_pod_install() {
  local log="$1"
  set +e
  pod install --deployment >"$log" 2>&1
  local status=$?
  set -e
  cat "$log"
  return "$status"
}

seed_known_broken_specs

log="$(mktemp)"
if run_pod_install "$log"; then
  exit 0
fi

echo "pod install failed; seeding missing specs from GitHub and retrying..."
if seed_from_install_log "$log" && run_pod_install "$log"; then
  exit 0
fi

echo "pod install failed after seeding CocoaPods specs from GitHub"
exit 1
