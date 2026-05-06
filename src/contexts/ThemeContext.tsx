import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

export type ThemePresetKey = "default" | "ocean" | "forest" | "sunset" | "rose" | "custom";

export interface ThemePreset {
  key: ThemePresetKey;
  label: string;
  // HSL strings: "H S% L%"
  primary: string;
  background: string;
  card: string;
  foreground: string;
}

export const THEME_PRESETS: Record<Exclude<ThemePresetKey, "custom">, ThemePreset> = {
  default: { key: "default", label: "Default · Yellow & Black", primary: "48 100% 50%", background: "0 0% 5%", card: "0 0% 8%", foreground: "0 0% 95%" },
  ocean:   { key: "ocean",   label: "Ocean Blue",              primary: "200 95% 45%", background: "210 40% 8%", card: "210 35% 12%", foreground: "200 25% 95%" },
  forest:  { key: "forest",  label: "Forest Green",            primary: "145 70% 42%", background: "150 25% 7%",  card: "150 20% 11%", foreground: "120 15% 95%" },
  sunset:  { key: "sunset",  label: "Sunset Orange",           primary: "20 95% 55%",  background: "20 30% 7%",   card: "20 25% 11%",  foreground: "30 25% 95%" },
  rose:    { key: "rose",    label: "Rose Pink",               primary: "340 85% 55%", background: "340 25% 8%",  card: "340 20% 12%", foreground: "340 15% 95%" },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  compactMode: boolean;
  setCompactMode: (v: boolean) => void;
  themePreset: ThemePresetKey;
  setThemePreset: (k: ThemePresetKey) => void;
  customPrimary: string; // HSL string
  setCustomPrimary: (hsl: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const clampFont = (n: number) => Math.min(100, Math.max(1, Math.round(n)));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("theme") as Theme) || "dark";
  });
  const [fontSize, setFontSizeState] = useState<number>(() => {
    if (typeof window === "undefined") return 20;
    return clampFont(Number(localStorage.getItem("app-font-size")) || 20);
  });
  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("app-reduced-motion") === "true";
  });
  const [compactMode, setCompactModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("app-compact-mode") === "true";
  });
  const [themePreset, setThemePresetState] = useState<ThemePresetKey>(() => {
    if (typeof window === "undefined") return "default";
    return (localStorage.getItem("theme-preset") as ThemePresetKey) || "default";
  });
  const [customPrimary, setCustomPrimaryState] = useState<string>(() => {
    if (typeof window === "undefined") return "270 80% 55%";
    return localStorage.getItem("theme-custom-primary") || "270 80% 55%";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-font-size", `${fontSize}px`);
    localStorage.setItem("app-font-size", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
    localStorage.setItem("app-reduced-motion", String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.classList.toggle("compact", compactMode);
    localStorage.setItem("app-compact-mode", String(compactMode));
  }, [compactMode]);

  // Apply preset / custom color overrides only in dark theme
  useEffect(() => {
    const root = document.documentElement;
    const apply = (primary: string, bg?: string, card?: string, fg?: string) => {
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--ring", primary);
      root.style.setProperty("--accent", primary);
      if (bg) root.style.setProperty("--background", bg);
      if (card) root.style.setProperty("--card", card);
      if (fg) root.style.setProperty("--card-foreground", fg);
    };
    const reset = () => {
      ["--primary","--ring","--accent","--background","--card","--card-foreground"].forEach(v => root.style.removeProperty(v));
    };
    if (theme === "light") { reset(); }
    else if (themePreset === "custom") { apply(customPrimary); }
    else if (themePreset === "default") { reset(); }
    else { const p = THEME_PRESETS[themePreset]; apply(p.primary, p.background, p.card, p.foreground); }
    localStorage.setItem("theme-preset", themePreset);
    localStorage.setItem("theme-custom-primary", customPrimary);
  }, [themePreset, customPrimary, theme]);

  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme: setThemeState,
        fontSize,
        setFontSize: (n) => setFontSizeState(clampFont(n)),
        reducedMotion,
        setReducedMotion: setReducedMotionState,
        compactMode,
        setCompactMode: setCompactModeState,
        themePreset,
        setThemePreset: setThemePresetState,
        customPrimary,
        setCustomPrimary: setCustomPrimaryState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
