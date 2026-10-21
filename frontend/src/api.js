const configuredApiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_BASE = configuredApiUrl.endsWith("/api")
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;

let csrfToken = "";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function setCsrfToken(token) {
  csrfToken = token || "";
}

export async function request(path, { method = "GET", body, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (method !== "GET" && csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const hasJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = hasJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      data?.error || "Algo salió mal. Inténtalo de nuevo.",
      response.status,
      data
    );
  }

  if (data?.csrf_token) {
    setCsrfToken(data.csrf_token);
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
};
