# AIOS Stage 2 Patch

This overlay advances the repository from the Tauri starter into the first real AIOS runtime milestone.

## Included

- `apps/desktop/src-tauri/src/core/state.rs`: thread-safe runtime state machine, process registry, event history, and unit tests.
- `apps/desktop/src-tauri/src/core/runtime.rs`: Tauri commands for runtime lifecycle and process creation.
- `apps/desktop/src-tauri/src/core/mod.rs`: core module declaration.
- `apps/desktop/src-tauri/src/lib.rs`: registers the runtime state and commands with Tauri.
- `apps/desktop/src/App.tsx`: AIOS control-plane UI wired to the Rust runtime.
- `apps/desktop/src/App.css`: replacement AIOS dark control-plane UI.
- `apps/desktop/index.html`: AIOS branding/metadata.
- `.github/workflows/ci.yml`: frontend build plus Rust test/check validation.

## Apply

Copy the contents of this folder over the matching paths in your cloned `Anuragp2077/AIOS` repository.

Then from `apps/desktop`:

```bash
npm ci
npm run build
npm run tauri dev
```

For the Rust core test suite:

```bash
cd src-tauri
cargo test --lib
cargo check
```

## Notes

The runtime intentionally does not execute terminal/filesystem/model operations yet. That boundary is deliberate: Stage 2 establishes lifecycle/state/IPC before Stage 3+ introduces projects, tools, models, sandboxing, and verification.
