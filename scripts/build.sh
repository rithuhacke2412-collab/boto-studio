#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required." >&2
  exit 1
fi

if ! command -v cargo >/dev/null 2>&1; then
  echo "cargo is required." >&2
  exit 1
fi

npm run build
cargo check --manifest-path src-tauri/Cargo.toml
