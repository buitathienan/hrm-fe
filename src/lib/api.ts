const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type ApiResult<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: string;
};

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const method = (init.method ?? "GET").toUpperCase();

  try {
    const headers = new Headers(init.headers);

    headers.set("Accept", "application/json");

    if (
      init.body &&
      !(init.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        data: null as T,
        message: result?.message ?? "Something went wrong",
        errors: result?.errors,
      };
    }

    return {
      success: true,
      data: extractDataFromRespone(result) as T,
      message: result?.message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`[api] ${method} ${path} - ${message}`);

    return {
      success: false,
      data: null as T,
      message: "Could not reach the API",
    };
  }
}

export const apiGet = <T>(path: string) => request<T>(path);
export const apiPost = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
export const apiPut = <T>(path: string, body: unknown) =>
  request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const apiPatch = <T>(path: string, body: unknown) =>
  request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
export const apiDelete = <T>(path: string) =>
  request<T>(path, {
    method: "DELETE",
  });

function extractDataFromRespone(
  payload: Record<string, unknown>[] | Record<string, unknown>,
) {
  if (!Array.isArray(payload)) {
    return payload.data ?? payload;
  }
  return payload;
}
