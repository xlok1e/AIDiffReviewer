use serde::Serialize;

#[derive(Serialize)]
pub struct AppHealth {
    status: String,
}

#[tauri::command]
pub fn get_app_health() -> Result<AppHealth, String> {
    Ok(AppHealth {
        status: "ready".to_string(),
    })
}
