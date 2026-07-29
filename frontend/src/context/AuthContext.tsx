import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiFetch, setUnauthorizedHandler } from "../lib/api";

export type Rol = "ADMIN" | "MESERO";

export interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  rol: Rol;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

interface SesionGuardada {
  token: string;
  usuario: Usuario;
}

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "posada-palomo-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function leerSesionGuardada(): SesionGuardada | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SesionGuardada;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionGuardada | null>(() => leerSesionGuardada());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSesion(null);
      localStorage.removeItem(STORAGE_KEY);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  async function login(usuario: string, password: string) {
    setIsLoading(true);
    try {
      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { usuario, password },
      });
      const nuevaSesion: SesionGuardada = { token: data.token, usuario: data.usuario };
      setSesion(nuevaSesion);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevaSesion));
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setSesion(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario: sesion?.usuario ?? null,
      token: sesion?.token ?? null,
      isLoading,
      login,
      logout,
    }),
    [sesion, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}
