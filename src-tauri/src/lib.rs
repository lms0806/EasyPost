// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;

#[derive(Serialize)]
struct ProxyResponse {
    ok: bool,
    status: u16,
    data: Option<Value>,
    error: Option<String>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn proxy_get(url: String, headers: Option<HashMap<String, String>>) -> ProxyResponse {
    proxy_request("GET", url, headers, None).await
}

#[tauri::command]
async fn proxy_post(
    url: String,
    headers: Option<HashMap<String, String>>,
    body: Option<Value>,
) -> ProxyResponse {
    proxy_request("POST", url, headers, body).await
}

async fn proxy_request(
    method: &str,
    url: String,
    headers: Option<HashMap<String, String>>,
    body: Option<Value>,
) -> ProxyResponse {
    let client = reqwest::Client::new();

    let mut request = match method {
        "POST" => client.post(&url),
        _ => client.get(&url),
    };

    if let Some(map) = headers {
        let mut header_map = reqwest::header::HeaderMap::new();
        for (key, value) in map {
            if let (Ok(name), Ok(val)) = (
                reqwest::header::HeaderName::from_bytes(key.as_bytes()),
                reqwest::header::HeaderValue::from_str(&value),
            ) {
                header_map.insert(name, val);
            }
        }
        request = request.headers(header_map);
    }

    if let Some(body_json) = body {
        request = request.json(&body_json);
    }

    let response = match request.send().await {
        Ok(resp) => resp,
        Err(err) => {
            return ProxyResponse {
                ok: false,
                status: 0,
                data: None,
                error: Some(err.to_string()),
            }
        }
    };

    let status = response.status().as_u16();
    let text = response.text().await.unwrap_or_default();

    let data = if text.is_empty() {
        None
    } else {
        Some(serde_json::from_str(&text).unwrap_or(Value::String(text.clone())))
    };

    let ok = (200..300).contains(&status);
    let error = if ok {
        None
    } else if !text.is_empty() {
        Some(text)
    } else {
        Some(format!("HTTP error {}", status))
    };

    ProxyResponse {
        ok,
        status,
        data,
        error,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, proxy_get, proxy_post])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
