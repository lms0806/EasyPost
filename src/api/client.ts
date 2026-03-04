import { invoke } from "@tauri-apps/api/core";

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function get<T = unknown>(
  url: string,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  try {
    const result = await invoke<ApiResponse<T>>("proxy_get", {
      url,
      headers,
    });
    return result;
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error:
        error instanceof Error ? error.message : "알 수 없는 네트워크 오류입니다.",
    };
  }
}

export async function post<T = unknown, B = unknown>(
  url: string,
  body?: B,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  try {
    const result = await invoke<ApiResponse<T>>("proxy_post", {
      url,
      headers,
      body,
    });
    return result;
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error:
        error instanceof Error ? error.message : "알 수 없는 네트워크 오류입니다.",
    };
  }
}

