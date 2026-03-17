use std::process::Command;

#[tauri::command]
fn sessions_json() -> Result<String, String> {
    let output = Command::new("agent-sessions")
        .arg("--json")
        .output()
        .map_err(|err| format!("failed to start agent-sessions: {err}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("agent-sessions failed: {}", stderr.trim()));
    }

    String::from_utf8(output.stdout)
        .map_err(|err| format!("agent-sessions returned non-utf8 output: {err}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![sessions_json])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
