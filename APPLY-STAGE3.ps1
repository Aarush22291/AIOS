$ErrorActionPreference = "Stop"

$sourceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Get-Location).Path

# The previous Stage 2 merge created several duplicate files at the repository root.
# Delete only those exact accidental paths; the real application remains under apps/desktop.
$accidentalRootFiles = @(
  "App.css",
  "App.tsx",
  "ci.yml",
  "index.html",
  "lib.rs",
  "mod.rs",
  "roadmap.md",
  "runtime.rs",
  "state.rs"
)

foreach ($relativePath in $accidentalRootFiles) {
  $destination = Join-Path $repoRoot $relativePath
  if (Test-Path $destination -PathType Leaf) {
    Remove-Item $destination -Force
    Write-Host "Removed accidental root file $relativePath"
  }
}

$files = @(
  "README.md",
  "docs/roadmap.md",
  ".github/workflows/ci.yml",
  "apps/desktop/index.html",
  "apps/desktop/src/App.tsx",
  "apps/desktop/src/App.css",
  "apps/desktop/src-tauri/tauri.conf.json",
  "apps/desktop/src-tauri/capabilities/default.json",
  "apps/desktop/src-tauri/src/lib.rs",
  "apps/desktop/src-tauri/src/core/mod.rs",
  "apps/desktop/src-tauri/src/core/state.rs",
  "apps/desktop/src-tauri/src/core/runtime.rs",
  "apps/desktop/src-tauri/src/core/projects.rs"
)

foreach ($relativePath in $files) {
  $source = Join-Path $sourceRoot $relativePath
  $destination = Join-Path $repoRoot $relativePath
  $destinationDir = Split-Path -Parent $destination

  if (-not (Test-Path $source)) {
    throw "Missing patch file: $source"
  }

  New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
  Copy-Item $source $destination -Force
  Write-Host "Updated $relativePath"
}

Write-Host ""
Write-Host "AIOS Stage 3 repair + Projects applied. Review the diff, then run:"
Write-Host "  cd apps/desktop"
Write-Host "  npm ci"
Write-Host "  npm run build"
Write-Host "  npm run tauri dev"
Write-Host ""
Write-Host "Then:"
Write-Host "  cd src-tauri"
Write-Host "  cargo test --lib"
Write-Host "  cargo check"
