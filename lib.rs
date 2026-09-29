mod core;

use core::runtime::{create_process, get_runtime_status, start_runtime, stop_runtime};
use core::state::RuntimeState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(RuntimeState::new())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_runtime_status,
            start_runtime,
            stop_runtime,
            create_process
        ])
        .run(tauri::generate_context!())
        .expect("error while running AIOS desktop");
}
