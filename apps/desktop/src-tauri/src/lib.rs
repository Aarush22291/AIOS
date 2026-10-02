mod core;

use core::projects::{
    get_projects, refresh_projects, register_project, remove_project, set_active_project, ProjectsState,
};
use core::runtime::{
    create_process, get_runtime_status, pause_process, resume_process, start_process, start_runtime,
    stop_process, stop_runtime,
};
use core::state::RuntimeState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(RuntimeState::new())
        .manage(ProjectsState::new())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_runtime_status,
            start_runtime,
            stop_runtime,
            create_process,
            start_process,
            pause_process,
            resume_process,
            stop_process,
            get_projects,
            register_project,
            remove_project,
            set_active_project,
            refresh_projects,
        ])
        .run(tauri::generate_context!())
        .expect("error while running AIOS desktop");
}
