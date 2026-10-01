use super::state::{ProcessInfo, RuntimeSnapshot, RuntimeState};
use tauri::{AppHandle, Emitter, State};

pub const RUNTIME_EVENT: &str = "aios:runtime";

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
    app.emit(RUNTIME_EVENT, &snapshot)
        .map_err(|error| format!("failed to emit runtime event: {error}"))?;
    Ok(snapshot)
}

#[tauri::command]
pub fn stop_runtime(
    state: State<'_, RuntimeState>,
    app: AppHandle,
) -> Result<RuntimeSnapshot, String> {
    let snapshot = state.stop()?;
    app.emit(RUNTIME_EVENT, &snapshot)
        .map_err(|error| format!("failed to emit runtime event: {error}"))?;
    Ok(snapshot)
}

#[tauri::command]
pub fn create_process(
    name: String,
    goal: String,
    state: State<'_, RuntimeState>,
    app: AppHandle,
) -> Result<ProcessInfo, String> {
    let (process, snapshot) = state.create_process(name, goal)?;
    app.emit(RUNTIME_EVENT, &snapshot)
        .map_err(|error| format!("failed to emit runtime event: {error}"))?;
    Ok(process)
}
