#!/usr/bin/env bash
# Runs the axe-core accessibility audit against a running local instance
# (npm run start / npm run watch on http://localhost:4200 by default).
#
# @axe-core/cli ships with its own bundled ChromeDriver, which regularly
# drifts out of sync with whatever Chrome version is actually installed
# (see "session not created: This version of ChromeDriver only supports
# Chrome version X"). To avoid that, this script detects the local Chrome
# version and downloads the exact matching ChromeDriver build from the
# official Chrome for Testing distribution, cached under .cache/chromedriver
# so it's only fetched once per Chrome version.
set -euo pipefail

URL="${1:-http://localhost:4200}"
CACHE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.cache/chromedriver"

case "$(uname -s)" in
  Darwin)
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    PLATFORM="mac-$([ "$(uname -m)" = "arm64" ] && echo arm64 || echo x64)"
    DRIVER_BIN="chromedriver"
    ;;
  Linux)
    CHROME_PATH="$(command -v google-chrome-stable || command -v google-chrome || command -v chromium-browser || command -v chromium)"
    PLATFORM="linux64"
    DRIVER_BIN="chromedriver"
    ;;
  *)
    echo "Unsupported OS: $(uname -s)" >&2
    exit 1
    ;;
esac

if [ ! -x "$CHROME_PATH" ]; then
  echo "Chrome not found at '$CHROME_PATH'. Install Google Chrome, or set CHROME_PATH." >&2
  exit 1
fi

CHROME_VERSION="$("$CHROME_PATH" --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+')"
DRIVER_DIR="$CACHE_DIR/$CHROME_VERSION"
DRIVER_PATH="$DRIVER_DIR/chromedriver-$PLATFORM/$DRIVER_BIN"

if [ ! -x "$DRIVER_PATH" ]; then
  echo "Fetching ChromeDriver $CHROME_VERSION for $PLATFORM..."
  mkdir -p "$DRIVER_DIR"
  ZIP="$DRIVER_DIR/chromedriver.zip"
  curl -fsSL "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/${PLATFORM}/chromedriver-${PLATFORM}.zip" -o "$ZIP"
  unzip -oq "$ZIP" -d "$DRIVER_DIR"
  chmod +x "$DRIVER_PATH"
  # macOS quarantines downloaded executables; clear it or Gatekeeper blocks the spawn.
  if [ "$(uname -s)" = "Darwin" ]; then
    xattr -dr com.apple.quarantine "$DRIVER_PATH" 2>/dev/null || true
  fi
fi

echo "Auditing $URL with Chrome $CHROME_VERSION..."
# --chrome-options is only strictly required when running as root/in a
# container (axe-core/cli skips its usual auto no-sandbox in that case
# since we supply --chrome-path ourselves), but it's harmless locally too.
exec npx axe "$URL" \
  --chrome-path "$CHROME_PATH" \
  --chromedriver-path "$DRIVER_PATH" \
  --chrome-options="no-sandbox,disable-dev-shm-usage,disable-gpu" \
  --exit
