import { FormEvent, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import "./App.css";

type View = "overview" | "projects" | "processes";
type RuntimeStatus = "stopped" | "running";
type ProcessStatus = "created" | "running" | "stopped";
type ProjectStatus = "ready" | "missing";
type InputChange = { currentTarget: HTMLInputElement };
type TextareaChange = { currentTarget: HTMLTextAreaElement };

type ProcessInfo = { id: string; name: string; goal: string; status: ProcessStatus; createdAt: number };
type RuntimeEvent = { id: number; timestamp: number; kind: string; message: string };
type RuntimeSnapshot = { version: string; status: RuntimeStatus; startedAt: number | null; uptimeSeconds: number; processCount: number; processes: ProcessInfo[]; events: RuntimeEvent[] };
type RepositoryInfo = { root: string; name: string; vcs: string };
type ProjectInfo = { id: string; name: string; workspace: string; status: ProjectStatus; repository: RepositoryInfo | null; createdAt: number; active: boolean };
type ProjectsSnapshot = { version: string; activeProjectId: string | null; projectCount: number; projects: ProjectInfo[] };

const RUNTIME_EVENT = "aios:runtime";
const PROJECTS_EVENT = "aios:projects";
const EMPTY_RUNTIME: RuntimeSnapshot = { version: "0.3.0", status: "stopped", startedAt: null, uptimeSeconds: 0, processCount: 0, processes: [], events: [] };
const EMPTY_PROJECTS: ProjectsSnapshot = { version: "0.3.0", activeProjectId: null, projectCount: 0, projects: [] };

function App() {
  const [view, setView] = useState<View>("overview");
  const [runtime, setRuntime] = useState<RuntimeSnapshot>(EMPTY_RUNTIME);
  const [projects, setProjects] = useState<ProjectsSnapshot>(EMPTY_PROJECTS);
  const [projectName, setProjectName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [processName, setProcessName] = useState("");
  const [processGoal, setProcessGoal] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stopRuntimeListener: UnlistenFn | undefined;
    let stopProjectsListener: UnlistenFn | undefined;
    void (async () => {
      try {
        const [runtimeSnapshot, projectSnapshot] = await Promise.all([
          invoke<RuntimeSnapshot>("get_runtime_status"),
          invoke<ProjectsSnapshot>("get_projects"),
        ]);
        setRuntime(runtimeSnapshot);
        setProjects(projectSnapshot);
        stopRuntimeListener = await listen<RuntimeSnapshot>(RUNTIME_EVENT, (event) => setRuntime(event.payload));
        stopProjectsListener = await listen<ProjectsSnapshot>(PROJECTS_EVENT, (event) => setProjects(event.payload));
      } catch (cause) {
        setError(String(cause));
      }
    })();
    return () => { stopRuntimeListener?.(); stopProjectsListener?.(); };
  }, []);

  const runtimeRunning = runtime.status === "running";
  const uptime = useMemo(() => formatDuration(runtime.uptimeSeconds), [runtime.uptimeSeconds]);
  const activeProject = projects.projects.find((project) => project.active) ?? null;

  async function toggleRuntime() {
    setError(""); setBusy(true);
    try {
      const command = runtimeRunning ? "stop_runtime" : "start_runtime";
      setRuntime(await invoke<RuntimeSnapshot>(command));
    } catch (cause) { setError(String(cause)); }
    finally { setBusy(false); }
  }

  async function handleRegisterProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!workspace.trim()) { setError("Enter a workspace path first."); return; }
    setBusy(true);
    try {
      await invoke<ProjectInfo>("register_project", { workspace, name: projectName.trim() || null });
      setProjectName(""); setWorkspace("");
    } catch (cause) { setError(String(cause)); }
    finally { setBusy(false); }
  }

  async function setActiveProject(id: string) {
    setError("");
    try { setProjects(await invoke<ProjectsSnapshot>("set_active_project", { id })); }
    catch (cause) { setError(String(cause)); }
  }

  async function removeProject(id: string) {
    setError("");
    try { setProjects(await invoke<ProjectsSnapshot>("remove_project", { id })); }
    catch (cause) { setError(String(cause)); }
  }

  async function refreshProjects() {
    setError("");
    try { setProjects(await invoke<ProjectsSnapshot>("refresh_projects")); }
    catch (cause) { setError(String(cause)); }
  }

  async function handleCreateProcess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!runtimeRunning) { setError("Start the AIOS runtime before creating a process."); return; }
    setBusy(true);
    try {
      await invoke<ProcessInfo>("create_process", { name: processName, goal: processGoal });
      setProcessName(""); setProcessGoal("");
    } catch (cause) { setError(String(cause)); }
    finally { setBusy(false); }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">A</div>
          <div><div className="eyebrow">AI-NATIVE</div><div className="brand-name">AIOS</div><div className="brand-subtitle">Operating Environment</div></div>
        </div>
        <nav className="nav-list" aria-label="Primary">
          <NavButton active={view === "overview"} onClick={() => setView("overview")} label="Overview" />
          <NavButton active={view === "projects"} onClick={() => setView("projects")} label="Projects" />
          <NavButton active={view === "processes"} onClick={() => setView("processes")} label="Processes" badge={runtime.processCount} />
          <button className="nav-item nav-disabled" disabled>Models <span>STAGE 5</span></button>
          <button className="nav-item nav-disabled" disabled>Settings <span>STAGE 1</span></button>
        </nav>
        <div className="sidebar-footer"><span className={`status-dot ${runtimeRunning ? "online" : "offline"}`} /><span>{runtimeRunning ? "Runtime online" : "Runtime offline"}</span></div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div><div className="breadcrumb">AIOS / {view}</div><h1>{pageTitle(view)}</h1></div>
          <div className="topbar-meta"><span className="version-chip">v{runtime.version}</span><button className="runtime-button" onClick={() => void toggleRuntime()} disabled={busy}><span className={`status-dot ${runtimeRunning ? "online" : "offline"}`} />{runtimeRunning ? "Stop runtime" : "Start runtime"}</button></div>
        </header>
        {error && <div className="error-banner">{error}</div>}
        {view === "overview" && <Overview runtime={runtime} runtimeRunning={runtimeRunning} uptime={uptime} activeProject={activeProject} projectCount={projects.projectCount} onProjects={() => setView("projects")} onProcesses={() => setView("processes")} />}
        {view === "projects" && <ProjectsPage projects={projects} projectName={projectName} workspace={workspace} busy={busy} onProjectName={setProjectName} onWorkspace={setWorkspace} onSubmit={handleRegisterProject} onActivate={(id) => void setActiveProject(id)} onRemove={(id) => void removeProject(id)} onRefresh={() => void refreshProjects()} />}
        {view === "processes" && <ProcessesPage runtime={runtime} runtimeRunning={runtimeRunning} processName={processName} processGoal={processGoal} busy={busy} onName={setProcessName} onGoal={setProcessGoal} onSubmit={handleCreateProcess} />}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, label, badge }: { active: boolean; onClick: () => void; label: string; badge?: number }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><span>{label}</span>{badge !== undefined && <span className="nav-badge">{badge}</span>}</button>;
}

function Overview({ runtime, runtimeRunning, uptime, activeProject, projectCount, onProjects, onProcesses }: { runtime: RuntimeSnapshot; runtimeRunning: boolean; uptime: string; activeProject: ProjectInfo | null; projectCount: number; onProjects: () => void; onProcesses: () => void }) {
  return <>
    <section className="hero-grid">
      <div className="panel-card hero-card">
        <div className="panel-label">Runtime state</div>
        <div className="runtime-state-row"><span className={`runtime-orb ${runtimeRunning ? "running" : "stopped"}`} /><div><div className="runtime-state-title">{runtimeRunning ? "AIOS runtime active" : "AIOS runtime stopped"}</div><div className="runtime-state-copy">{runtimeRunning ? "The control plane is connected to the Rust core and ready for managed processes." : "Start the core runtime to unlock managed AI processes."}</div></div></div>
        <div className="metric-strip"><Metric label="Uptime" value={uptime} /><Metric label="Processes" value={String(runtime.processCount)} /><Metric label="Projects" value={String(projectCount)} /></div>
      </div>
      <div className="panel-card active-project-card">
        <div className="section-header"><div><div className="panel-label">Active workspace</div><h2>{activeProject?.name ?? "No project selected"}</h2></div><span className={`state-chip ${activeProject?.status ?? "missing"}`}>{activeProject ? activeProject.status : "none"}</span></div>
        <div className="path-value">{activeProject?.workspace ?? "Register a project workspace to give AIOS a context root."}</div>
        {activeProject?.repository ? <RepoInline repository={activeProject.repository} /> : <div className="repo-inline muted"><span className="repo-dot" /><div><strong>No repository detected</strong><span>AIOS will still keep the workspace registered.</span></div></div>}
        <button className="secondary-button" onClick={onProjects}>{projectCount ? "Manage projects" : "Register first project"}</button>
      </div>
    </section>

    <section className="panel-card architecture-card">
      <div className="section-header"><div><div className="panel-label">Stage 3 architecture</div><h2>Projects become the context boundary.</h2></div><button className="text-button" onClick={onProcesses}>Open process manager →</button></div>
      <div className="architecture-flow"><FlowNode title="Desktop" subtitle="React + Tauri" /><span className="flow-arrow">→</span><FlowNode title="Core" subtitle="Rust runtime" /><span className="flow-arrow">→</span><FlowNode title="Projects" subtitle="Workspace registry" /><span className="flow-arrow">→</span><FlowNode title="Processes" subtitle="Managed work" /></div>
      <div className="architecture-note">A project records its workspace, active state, and repository root without running Git commands or AI work.</div>
    </section>

    <section className="content-grid">
      <div className="panel-card compact-card"><div className="panel-label">Core events</div><h2>Runtime activity</h2><div className="activity-list">{runtime.events.slice(0, 5).map((event) => <div className="activity-row" key={event.id}><span className="event-index">#{event.id}</span><div><strong>{event.kind}</strong><span>{event.message}</span></div></div>)}{runtime.events.length === 0 && <div className="empty-state small">No runtime events yet.</div>}</div></div>
      <div className="panel-card compact-card"><div className="panel-label">Why Stage 3 matters</div><h2>Context before autonomy.</h2><p className="body-copy">AIOS now knows what workspace a future AI process is operating on. Later tools, verification and memory can attach to a stable project identity.</p><div className="principle-strip"><span>Workspace</span><span>Repository</span><span>State</span><span>Process context</span></div></div>
    </section>
  </>;
}

function ProjectsPage({ projects, projectName, workspace, busy, onProjectName, onWorkspace, onSubmit, onActivate, onRemove, onRefresh }: { projects: ProjectsSnapshot; projectName: string; workspace: string; busy: boolean; onProjectName: (value: string) => void; onWorkspace: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onActivate: (id: string) => void; onRemove: (id: string) => void; onRefresh: () => void }) {
  return <section className="projects-layout">
    <div className="panel-card registration-card"><div className="panel-label">Project registration</div><h2>Add a workspace</h2><p className="body-copy">Register a local directory. AIOS canonicalizes the path and walks its parents for a Git repository marker.</p>
      <form className="project-form" onSubmit={onSubmit}><label>Workspace path<input value={workspace} onChange={(event: InputChange) => onWorkspace(event.currentTarget.value)} placeholder="C:\\Projects\\my-app" maxLength={500} /></label><label>Display name <span className="optional">optional</span><input value={projectName} onChange={(event: InputChange) => onProjectName(event.currentTarget.value)} placeholder="Defaults to folder name" maxLength={80} /></label><button className="primary-button" type="submit" disabled={busy}>Register project</button></form><div className="form-footnote">No shell commands are executed during registration.</div>
    </div>
    <div className="panel-card projects-card"><div className="section-header"><div><div className="panel-label">Workspace registry</div><h2>{projects.projectCount} registered</h2></div><button className="secondary-button small-button" onClick={onRefresh}>Refresh state</button></div>
      <div className="project-list">{projects.projects.map((project) => <div className={`project-row ${project.active ? "selected" : ""}`} key={project.id}><div className="project-main"><div className="project-title-row"><strong>{project.name}</strong><span className={`state-chip ${project.status}`}>{project.status}</span>{project.active && <span className="active-pill">ACTIVE</span>}</div><div className="project-path">{project.workspace}</div><div className="project-meta"><span>{project.id}</span>{project.repository ? <span>Git: {project.repository.name}</span> : <span>No repository</span>}</div></div><div className="project-actions">{!project.active && <button className="text-button" onClick={() => onActivate(project.id)}>Set active</button>}<button className="danger-button" onClick={() => onRemove(project.id)}>Remove</button></div></div>)}{projects.projects.length === 0 && <div className="empty-state"><div className="empty-icon">⌂</div><div>No projects registered.</div><span>Add your first workspace to establish AIOS project context.</span></div>}</div>
    </div>
  </section>;
}

function ProcessesPage({ runtime, runtimeRunning, processName, processGoal, busy, onName, onGoal, onSubmit }: { runtime: RuntimeSnapshot; runtimeRunning: boolean; processName: string; processGoal: string; busy: boolean; onName: (value: string) => void; onGoal: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <section className="content-grid">
    <div className="panel-card process-card"><div className="section-header"><div><div className="panel-label">Process registration</div><h2>Create a process</h2></div><span className="count-chip">{runtime.processCount}</span></div><form className="process-form" onSubmit={onSubmit}><label>Name<input value={processName} onChange={(event: InputChange) => onName(event.currentTarget.value)} placeholder="e.g. Repository Planner" maxLength={80} /></label><label>Goal<textarea value={processGoal} onChange={(event: TextareaChange) => onGoal(event.currentTarget.value)} placeholder="What should this process accomplish?" maxLength={240} rows={4} /></label><button type="submit" className="primary-button" disabled={busy || !runtimeRunning}>{runtimeRunning ? "Create process" : "Start runtime first"}</button></form></div>
    <div className="panel-card process-card"><div className="panel-label">Registered processes</div><h2>Current runtime state</h2><div className="process-list">{runtime.processes.map((process) => <div className="process-row" key={process.id}><div><div className="process-title-row"><strong>{process.name}</strong><span>{process.id}</span></div><div className="process-goal">{process.goal}</div></div><span className={`process-status ${process.status}`}>{process.status}</span></div>)}{runtime.processes.length === 0 && <div className="empty-state small">No AI processes registered yet.</div>}</div></div>
  </section>;
}

function RepoInline({ repository }: { repository: RepositoryInfo }) { return <div className="repo-inline"><span className="repo-dot" /><div><strong>{repository.name}</strong><span>{repository.vcs.toUpperCase()} repository detected</span></div></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="metric"><span>{label}</span><strong>{value}</strong></div>; }
function FlowNode({ title, subtitle }: { title: string; subtitle: string }) { return <div className="flow-node"><strong>{title}</strong><span>{subtitle}</span></div>; }
function pageTitle(view: View) { return view === "projects" ? "Project Spaces" : view === "processes" ? "AI Processes" : "Control Plane"; }
function formatDuration(totalSeconds: number) { const hours = Math.floor(totalSeconds / 3600); const minutes = Math.floor((totalSeconds % 3600) / 60); const seconds = totalSeconds % 60; if (hours > 0) return `${hours}h ${minutes}m`; if (minutes > 0) return `${minutes}m ${seconds}s`; return `${seconds}s`; }

export default App;
