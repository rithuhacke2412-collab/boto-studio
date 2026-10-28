# Boto Studio

Boto Studio is an offline Windows automation desktop app. The initial implementation is a Tauri v2 + Rust shell with a WebView frontend, local persistence, script scanning, approval flow, and run engine scaffolding that matches the supplied dark-neumorphic UI.

## Quick start

1. Install Rust and Node.js.
2. Install frontend dependencies:
   npm install
3. Run the app:
   npm run tauri dev
4. Build a release:
   npm run tauri build

## Features implemented in this pass

- App shell, sidebar, theme switch, and Upload screen styling matching the sample UI.
- Theme persistence via localStorage.
- Local automation data model under the user's app data folder.
- Upload flow for paste vs file location, language selection, validation, and code scan.
- Script approval gating before the first run or after file changes.
- Run engine command that executes PowerShell, Batch, or Python scripts with timeout and output capture.
- Safety/validation helpers for names, paths, IDs, and scanning.

## Known limitations

- Scheduled tasks and full Windows Task Scheduler integration are scaffolded but not fully validated here because this environment is not a real Windows PC.
- The supplied logo asset was not present in the repository; a clear placeholder SVG was added instead, and the project marks it as such.
- The repository contains a real project skeleton and working app logic, but real Windows runtime validation must be run on an actual Windows machine.

## Project structure

- `src/` - frontend HTML, CSS, and JavaScript.
- `src-tauri/` - Tauri + Rust backend.
- `scripts/` - build, run, test, and measure utilities.
- `assets/` - placeholder logo asset.

## License

Apache License 2.0.
