use super::state::{ProcessInfo, ProcessResourceConfig, RuntimeSnapshot, RuntimeState};
use tauri::{AppHandle, Emitter, State};

pub const RUNTIME_EVENT: &str = "aios:runtime";

fn emit_runtime(app: &AppHandle, snapshot: &RuntimeSnapshot) -> Result<(), String> {
    app.emit(RUNTIME_EVENT, snapshot)
        .map_err(|error| format!("failed to emit runtime event: {error}"))
}

#[tauri::command]
pub fn get_runtime_status(state: State<'_, RuntimeState>) -> RuntimeSnapshot {
    state.snapshot()
}

#[tauri::command]
pub fn start_runtime(
    state: State<'_, RuntimeState>,
    app: AppHandle,
) -> Result<RuntimeSnapshot, String> {
    let snapshot = state.start()?;
    emit_runtime(&app, &snapshot)?;
    Ok(snapshot)
}

#[tauri::command]
pub fn stop_runtime(
    state: State<'_, RuntimeState>,
    app: AppHandle,
) -> Result<RuntimeSnapshot, String> {
    let snapshot = state.stop()?;
    emit_runtime(&app, &snapshot)?;
    Ok(snapshot)
}

#[tauri::command]
pub fn create_process(
    name: String,
    goal: String,
    resources: ProcessResourceConfig,
    state: State<'_, RuntimeState>,
    app: AppHandle,
) -> Result<ProcessInfo, String> {
    let (process, snapshot) = state.create_process(name, goal, resources)?;
    emit_runtime(&app, &snapshot)?;
    Ok(process)
}

#[tauri::command]
pub fn start_process(
    id: String,
    state: State<'_, RuntimeState>,
    app: AppHandle,
) -> Result<RuntimeSnapshot, String> {
    let snapshot = state.start_process(&id)?;
    emit_runtime(&app, &snapshot)?;
    Ok(snapshot)
}

#[tauri::command]
pub fn pause_process(
    id: String,
    state: State<'_, RuntimeState>,
    app: AppHandle,
) -> Result<RuntimeSnapshot, String> {
    let snapshot = state.pause_process(&id)?;
    emit_runtime(&app, &snapshot)?;
    Ok(snapshot)
}

#[tauri::command]
pub fn resume_process(
    id: String,
    state: State<'_, RuntimeState>,
    app: AppHandle,
) -> Result<RuntimeSnapshot, String> {
    let snapshot = state.resume_process(&id)?;
    emit_runtime(&app, &snapshot)?;
    Ok(snapshot)
}

#[tauri::command]
pub fn stop_process(
    id: String,
    state: State<'_, RuntimeState>,
    app: AppHandle,
) -> Result<RuntimeSnapshot, String> {
    let snapshot = state.stop_process(&id)?;
    emit_runtime(&app, &snapshot)?;
    Ok(snapshot)
}
