import "server-only";

import { ApiFailure, ApiPostSuccess } from "@/app/types/api-response.types";
import { redirect } from "next/navigation";
import { clearSession } from "@/features/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type ApiPostResult<T> = ApiPostSuccess<T> | ApiFailure;

export async function apiPost<T>(
  endpoint: string,
  body: unknown,
): Promise<ApiPostResult<T>> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return {
      success: false,
      message: "Unable to connect to the server. Please try again.",
    };
  }

  if (response.status === 401) {
    clearSession();
    redirect("/");
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: result?.message ?? "Something went wrong. Please try again.",
      errors: result?.errors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

export async function apiGet(
  endpoint: string,
  query?: Record<string, string | number | boolean>,
) {
  const urlSearchParam = new URLSearchParams();
  if (query) {
    for (const key in query) {
      urlSearchParam.append(key, String(query[key]));
    }
  }

  const res = await fetch(
    `${API_URL}/${endpoint}${query ? `?${urlSearchParam.toString()}` : ``}`,
    {
      credentials: "include",
    },
  );

  if (!res) {
    return {
      success: false,
      message: "Unable to connect to the server. Please try again.",
    };
  }

  if (res.status === 401) {
    clearSession();
    redirect("/");
  }

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      success: false,
      message: result?.message ?? "Something went wrong. Please try again.",
      errors: result?.errors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
