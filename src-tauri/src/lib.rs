mod commands;
pub mod shared;

pub fn run_application() -> tauri::Result<()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![commands::app::get_app_health])
        .run(tauri::generate_context!())
}
