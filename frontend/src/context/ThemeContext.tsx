import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Tema = "dark" | "light";

interface ThemeContextValue {
  tema: Tema;
  toggleTema: () => void;
}

const STORAGE_KEY = "posada-palomo-tema";
const THEME_COLOR: Record<Tema, string> = { dark: "#1D1E1C", light: "#F2F0E9" };

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function leerTemaGuardado(): Tema {
  return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => leerTemaGuardado());

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    localStorage.setItem(STORAGE_KEY, tema);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[tema]);
  }, [tema]);

  function toggleTema() {
    setTema((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const value = useMemo<ThemeContextValue>(() => ({ tema, toggleTema }), [tema]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return context;
}
