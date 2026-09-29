fn main() {
    const COMMANDS: &[&str] = &[
        "get_runtime_status",
        "start_runtime",
        "stop_runtime",
        "create_process",
        "get_projects",
        "register_project",
        "remove_project",
        "set_active_project",
        "refresh_projects",
    ];

    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(tauri_build::AppManifest::new().commands(COMMANDS)),
    )
    .expect("failed to run tauri-build");
}
