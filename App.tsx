import { FormEvent, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import "./App.css";

type RuntimeStatus = "stopped" | "running";
type ProcessStatus = "created" | "running" | "stopped";

type ProcessInfo = {
  id: string;
  name: string;
  goal: string;
  status: ProcessStatus;
  createdAt: number;
};

type CoreEvent = {
  id: number;
  timestamp: number;
  kind: string;
  message: string;
};

type RuntimeSnapshot = {
  version: string;
  status: RuntimeStatus;
  startedAt: number | null;
  uptimeSeconds: number;
  processCount: number;
  processes: ProcessInfo[];
  events: CoreEvent[];
};

const EMPTY_SNAPSHOT: RuntimeSnapshot = {
  version: "0.2.0",
  status: "stopped",
  startedAt: null,
  uptimeSeconds: 0,
  processCount: 0,
  processes: [],
  events: [],
};

const RUNTIME_EVENT = "aios:runtime";

function App() {
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(EMPTY_SNAPSHOT);
  const [processName, setProcessName] = useState("");
  const [processGoal, setProcessGoal] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    void (async () => {
      try {
        setSnapshot(await invoke<RuntimeSnapshot>("get_runtime_status"));
        unlisten = await listen<RuntimeSnapshot>(RUNTIME_EVENT, (event) => {
          setSnapshot(event.payload);
        });
      } catch (cause) {
        setError(String(cause));
      }
    })();

    return () => {
      unlisten?.();
    };
  }, []);

  const runtimeRunning = snapshot.status === "running";
  const uptime = useMemo(() => formatDuration(snapshot.uptimeSeconds), [snapshot.uptimeSeconds]);

  async function toggleRuntime() {
    setError("");
    setBusy(true);
    try {
      const command = runtimeRunning ? "stop_runtime" : "start_runtime";
      setSnapshot(await invoke<RuntimeSnapshot>(command));
    } catch (cause) {
      setError(String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateProcess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!runtimeRunning) {
      setError("Start the AIOS runtime before creating a process.");
      return;
    }

    setBusy(true);
    try {
      await invoke<ProcessInfo>("create_process", {
        name: processName,
        goal: processGoal,
      });
      setProcessName("");
      setProcessGoal("");
    } catch (cause) {
      setError(String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">A</div>
        <div>
          <div className="eyebrow">AI-NATIVE</div>
          <div className="brand-name">AIOS</div>
          <div className="brand-subtitle">Operating Environment</div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <button className="nav-item active">Overview</button>
          <button className="nav-item">Projects</button>
          <button className="nav-item">Processes</button>
          <button className="nav-item">Models</button>
          <button className="nav-item">Settings</button>
        </nav>

        <div className="sidebar-footer">
          <span className={`status-dot ${runtimeRunning ? "online" : "offline"}`} />
          <span>{runtimeRunning ? "Runtime online" : "Runtime offline"}</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <div className="breadcrumb">AIOS / Runtime</div>
            <h1>Control Plane</h1>
          </div>
          <div className="topbar-meta">
            <span className="version-chip">v{snapshot.version}</span>
            <button className="runtime-button" onClick={() => void toggleRuntime()} disabled={busy}>
              <span className={`status-dot ${runtimeRunning ? "online" : "offline"}`} />
              {runtimeRunning ? "Stop runtime" : "Start runtime"}
            </button>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <section className="hero-grid">
          <div className="hero-card panel-card">
            <div className="panel-label">Runtime state</div>
            <div className="runtime-state-row">
              <span className={`runtime-orb ${runtimeRunning ? "running" : "stopped"}`} />
              <div>
                <div className="runtime-state-title">{runtimeRunning ? "AIOS runtime active" : "AIOS runtime stopped"}</div>
                <div className="runtime-state-copy">
                  {runtimeRunning
                    ? "Core services are available for processes and future model/tool integrations."
                    : "Start the core runtime to create and manage AI processes."}
                </div>
              </div>
            </div>
            <div className="metric-strip">
              <Metric label="Uptime" value={uptime} />
              <Metric label="Processes" value={String(snapshot.processCount)} />
              <Metric label="Events" value={String(snapshot.events.length)} />
            </div>
          </div>

          <div className="architecture-card panel-card">
            <div className="panel-label">Stage 2 architecture</div>
            <div className="architecture-flow">
              <FlowNode title="Desktop" subtitle="React + Tauri" />
              <span className="flow-arrow">→</span>
              <FlowNode title="Core" subtitle="Rust runtime" />
              <span className="flow-arrow">→</span>
              <FlowNode title="Processes" subtitle="Managed state" />
            </div>
            <div className="architecture-note">
              Commands provide request/response IPC; runtime events keep the desktop synchronized with core state.
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel-card process-card">
            <div className="section-header">
              <div>
                <div className="panel-label">AI processes</div>
                <h2>Create a process</h2>
              </div>
              <span className="count-chip">{snapshot.processCount}</span>
            </div>

            <form className="process-form" onSubmit={(event: FormEvent<HTMLFormElement>) => void handleCreateProcess(event)}>
              <label>
                Name
                <input
                  value={processName}
                  onChange={(event: { currentTarget: HTMLInputElement }) => setProcessName(event.currentTarget.value)}
                  placeholder="e.g. Repository Planner"
                  maxLength={80}
                />
              </label>
              <label>
                Goal
                <textarea
                  value={processGoal}
                  onChange={(event: { currentTarget: HTMLTextAreaElement }) => setProcessGoal(event.currentTarget.value)}
                  placeholder="What should this process accomplish?"
                  maxLength={240}
                  rows={3}
                />
              </label>
              <button type="submit" className="primary-button" disabled={busy || !runtimeRunning}>
                {runtimeRunning ? "Create process" : "Start runtime first"}
              </button>
            </form>

            <div className="process-list">
              {snapshot.processes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">+</div>
                  <div>No AI processes yet.</div>
                  <span>Create one to exercise the new runtime state machine.</span>
                </div>
              ) : (
                snapshot.processes.map((process) => (
                  <div className="process-row" key={process.id}>
                    <div>
                      <div className="process-name">{process.name}</div>
                      <div className="process-goal">{process.goal}</div>
                    </div>
                    <span className={`process-status ${process.status}`}>{process.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel-card event-card">
            <div className="section-header">
              <div>
                <div className="panel-label">Evidence trail</div>
                <h2>Core activity</h2>
              </div>
              <span className="live-chip">LIVE</span>
            </div>

            <div className="event-list">
              {snapshot.events.length === 0 ? (
                <div className="empty-state compact">No runtime events yet.</div>
              ) : (
                snapshot.events.map((event) => (
                  <div className="event-row" key={event.id}>
                    <div className="event-marker" />
                    <div>
                      <div className="event-kind">{event.kind}</div>
                      <div className="event-message">{event.message}</div>
                      <div className="event-time">{formatTimestamp(event.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FlowNode({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flow-node">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatTimestamp(seconds: number) {
  return new Date(seconds * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default App;
