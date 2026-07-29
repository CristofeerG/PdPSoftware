import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

interface UseApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

/** Envuelve apiFetch adjuntando automaticamente el token de la sesion actual. */
export function useApi() {
  const { token } = useAuth();

  return useCallback(
    <T,>(path: string, options?: UseApiOptions) => apiFetch<T>(path, { ...options, token }),
    [token],
  );
}
