const API_BASE = "/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", 0);
  }

  // Un 401 en una peticion que SI llevaba token significa sesion invalida/expirada.
  // Un 401 sin token (ej. login con credenciales incorrectas) es un error normal
  // que el llamador debe mostrar, no un cierre de sesion.
  if (response.status === 401 && token) {
    onUnauthorized?.();
  }

  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : response.statusText || "Error de red";
    throw new ApiError(message, response.status);
  }

  return data as T;
}
