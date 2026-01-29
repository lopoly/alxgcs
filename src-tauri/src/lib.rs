//! AIRLOGIX GCS - Ground Control Station Backend
//!
//! This module provides the Tauri backend for the GCS application,
//! including MAVLink communication, telemetry processing, and mission management.

use tauri::Manager;

/// Initialize the Tauri application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Simple greeting command for testing IPC
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to AIRLOGIX GCS.", name)
}

/// Get application version
#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
