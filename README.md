# AIOS

**AI-Native Operating Environment**

AIOS is an open-source project exploring what an operating environment would look like if AI agents were treated as first-class computational processes rather than ordinary applications.

The project starts as a desktop application and is designed to progressively evolve into an AI-native runtime and, eventually, a Linux-based operating system.

## Vision

AIOS aims to coordinate:

* AI Processes
* Local and cloud models
* Project and long-term memory
* Tool execution
* Permissions and capabilities
* Sandboxed execution
* Verification and evidence
* Git-based workflows
* Human approval

The long-term architecture is:

```text
User
  ↓
AIOS Desktop
  ↓
AIOS Control Plane
  ↓
AIOS Runtime
  ↓
Security / Sandbox
  ↓
Linux
  ↓
Hardware
```

## Development Strategy

AIOS is being developed progressively:

```text
Stage 0   Foundation
Stage 1   Desktop Shell
Stage 2   AIOS Core
Stage 3   Projects
Stage 4   AI Processes
Stage 5   Models
Stage 6   Tools
Stage 7   Sandbox
Stage 8   Verification
Stage 9   Memory
Stage 10  Orchestration
Stage 11  AIOS Runtime
Stage 12  Linux Port
Stage 13  AIOS Linux
Stage 14  Hardening
```

The initial implementation will run as a desktop application on Windows. Core functionality will be separated from the UI so that the same runtime can later be adapted to Linux.

## Project Structure

```text
apps/
  desktop/          AIOS desktop application

core/
  orchestrator/     Task planning and coordination
  processes/        AI Process lifecycle
  models/           Model providers and routing
  memory/           AIOS memory systems
  tools/            Tool interfaces and execution
  permissions/      Capabilities and access control
  verification/     Verification and evidence
  git/              Git and repository integration

protocol/            Internal communication protocols
sandbox/             Agent isolation
docs/                Architecture and technical documentation
tests/               Cross-component tests
```

## Current Status

**Stage 0 — Foundation**

The repository and development architecture are being established.

## Principles

### AI is not automatically trusted

AIOS is designed around explicit permissions, controlled tool access, sandboxing and verification.

### AI should prove its work

An AI Process should not simply claim that a task is complete. AIOS aims to collect evidence such as builds, tests, diffs and verification results.

### Humans remain in control

AIOS is intended to automate execution while keeping meaningful approval and control with the user.

### Local-first

The architecture is designed to support local AI models where practical, with optional cloud models where explicitly permitted.

### Open source

The project is intended to be developed transparently through GitHub, issues, pull requests and versioned releases.

## Roadmap

See [`docs/roadmap.md`](docs/roadmap.md) for the development roadmap.

## License

AIOS is released under the Apache License 2.0.
