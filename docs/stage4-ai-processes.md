# Stage 4 — AI Processes

Stage 4 turns process registration into a stateful lifecycle manager.

## Scope

AIOS now models each process with:

- stable process ID
- human-readable name
- explicit goal
- lifecycle state
- creation/start/stop/update timestamps
- resource-policy metadata

Supported lifecycle:

`created → running → paused → running → stopped`

A stopped process can be started again while the runtime is active. Failed is reserved as a terminal state for future execution errors.

## Commands

- `create_process`
- `start_process`
- `pause_process`
- `resume_process`
- `stop_process`

All transitions emit the `aios:runtime` snapshot event.

## Resource metadata

A process may declare:

- maximum CPU percentage
- maximum memory in MB
- maximum runtime in seconds

Stage 4 records and validates these values. It does not enforce them at the host level. Enforcement belongs to the Stage 7 sandbox/capability system.

## Deliberate boundary

Stage 4 still does not execute an AI model, shell command, filesystem mutation, network request, or external tool. The process is the lifecycle/control-plane primitive that later execution layers will consume.
