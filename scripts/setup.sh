#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js is required to build Boto Studio." >&2
  exit 1
fi

if ! command -v cargo >/dev/null 2>&1; then
  echo "Rust is required to build Boto Studio." >&2
  exit 1
fi

npm install
npm run build
cargo check --manifest-path src-tauri/Cargo.toml

echo "Setup completed. Use npm run tauri dev to launch the app."
