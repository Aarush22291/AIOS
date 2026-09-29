# AIOS Stage 3 — Repair + Projects

This patch is based on the **actual current `main` branch**.

## Important repository-state repair

The Stage 2 merge commit landed, but the Stage 2 overlay files were also added at the repository root instead of replacing the corresponding files under `apps/desktop/` and `.github/workflows/`.

This patch therefore does two things:

1. Removes only the nine accidental root duplicates created by that merge.
2. Installs the intended Stage 2 implementation in the real Tauri application paths and adds Stage 3 Projects.

The accidental files removed are:

- `App.css`
- `App.tsx`
- `ci.yml`
- `index.html`
- `lib.rs`
- `mod.rs`
- `roadmap.md`
- `runtime.rs`
- `state.rs`

## Stage 3 functionality

- Project registration
- Workspace canonicalization
- Project metadata
- Active project selection
- Project removal
- Workspace state refresh
- Git repository marker detection through parent directories
- Project state events
- Projects control-plane UI
- Runtime + Projects integration
- Rust unit tests for project invariants

## Apply

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\AIOS-stage3-repair-files\APPLY-STAGE3.ps1
```

Then inspect the diff before committing.

## Validation

```powershell
cd apps/desktop
npm ci
npm run build
npm run tauri dev
```

Then:

```powershell
cd src-tauri
cargo test --lib
cargo check
```

The patch was strictly type-checked at the frontend layer in the preparation environment. Rust/Tauri execution was not available there because `cargo`/`rustc` were not installed.
