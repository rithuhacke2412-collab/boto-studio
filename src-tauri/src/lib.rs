use tauri::Manager;

mod commands;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::scan_script,
            commands::run_script,
            commands::read_app_data_dir,
            commands::write_data_file,
            commands::load_data_file,
            commands::validate_automation_name,
            commands::validate_path
        ])
        .setup(|app| {
            let _window = app.get_webview_window("main").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
