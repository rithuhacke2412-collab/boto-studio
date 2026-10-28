#!/usr/bin/env bash
set -euo pipefail

du -sh dist src-tauri 2>/dev/null || true
