# AIOS Roadmap

AIOS is developed incrementally. Each stage should produce a working, testable result before the project moves to the next stage.

## Stage 0 — Foundation

* [x] Repository structure
* [x] Documentation structure
* [x] Contribution guidelines
* [x] License
* [x] GitHub workflow
* [x] Development conventions

**Result:** Professional open-source project foundation.

## Stage 1 — Desktop Shell

* [x] Tauri application
* [x] React + TypeScript interface
* [x] AIOS navigation shell
* [x] Runtime/process interface
* [ ] Projects interface
* [ ] Settings

**Result:** AIOS launches as a desktop application.

## Stage 2 — AIOS Core

* [x] Rust core module
* [x] Runtime lifecycle
* [x] Runtime state model
* [x] Process registration
* [x] Event system
* [x] Desktop-to-core communication
* [x] Core unit tests
* [x] Frontend/Rust CI validation

**Result:** The desktop application communicates with a real AIOS runtime.

## Stage 3 — Projects

* [ ] Project registration
* [ ] Project metadata
* [ ] Workspace management
* [ ] Repository detection
* [ ] Project state

**Result:** AIOS understands the projects it operates on.

## Stage 4 — AI Processes

* [ ] Process creation beyond registration
* [ ] Goals
* [ ] Process state
* [ ] Lifecycle management
* [ ] Resource configuration
* [ ] Process events

**Result:** AIOS can create and manage its first AI Process.

## Stage 5 — Models

* [ ] Model provider interface
* [ ] Local model support
* [ ] Cloud model support
* [ ] Model roles
* [ ] Model selection

**Result:** AIOS can execute AI tasks through a unified model interface.

## Stage 6 — Tools

* [ ] Filesystem tools
* [ ] Terminal tools
* [ ] Git tools
* [ ] Search tools
* [ ] Test execution

**Result:** AI Processes can interact with projects.

## Stage 7 — Sandbox

* [ ] Capability system
* [ ] Permission enforcement
* [ ] Process isolation
* [ ] Resource limits
* [ ] Network restrictions

**Result:** AI Processes operate within controlled boundaries.

## Stage 8 — Verification

* [ ] Build verification
* [ ] Test execution
* [ ] Diff inspection
* [ ] Evidence collection
* [ ] Audit records
* [ ] Human approval

**Result:** AIOS can distinguish attempted work from verified work.

## Stage 9 — Memory

* [ ] Working memory
* [ ] Project memory
* [ ] Episodic memory
* [ ] Semantic memory
* [ ] Artifact references
* [ ] Provenance

**Result:** AIOS can maintain structured project context.

## Stage 10 — Orchestration

* [ ] Planner
* [ ] Task graphs
* [ ] Multiple AI Processes
* [ ] Model routing
* [ ] Dependencies
* [ ] Failure recovery

**Result:** AIOS can coordinate complex multi-step tasks.

## Stage 11 — AIOS Runtime

* [ ] Separate runtime from desktop
* [ ] Headless operation
* [ ] Stable APIs
* [ ] Runtime configuration
* [ ] Service architecture

**Result:** AIOS is no longer dependent on its graphical interface.

## Stage 12 — Linux Port

* [ ] Linux runtime
* [ ] systemd integration
* [ ] Linux sandboxing
* [ ] Linux permissions
* [ ] GPU integration

**Result:** AIOS runs natively as a Linux runtime.

## Stage 13 — AIOS Linux

* [ ] Linux image
* [ ] AIOS services
* [ ] AIOS desktop
* [ ] Boot process
* [ ] Installer
* [ ] Hardware support

**Result:** First bootable AIOS Linux distribution.

## Stage 14 — Hardening

* [ ] Signed releases
* [ ] Immutable system
* [ ] Atomic updates
* [ ] Rollback
* [ ] Recovery
* [ ] Security hardening

**Result:** Production-oriented AIOS distribution.
