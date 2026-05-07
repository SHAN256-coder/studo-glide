import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

export type ThemePresetKey =
  | "default" | "ocean" | "forest" | "sunset" | "rose"
  | "violet" | "crimson" | "teal" | "amber" | "indigo" | "lime" | "magenta"
  | "custom";

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
  default: { key: "default", label: "Yellow",  primary: "48 100% 50%", background: "0 0% 5%", card: "0 0% 8%", foreground: "0 0% 95%" },
  ocean:   { key: "ocean",   label: "Ocean",   primary: "200 95% 45%", background: "210 40% 8%", card: "210 35% 12%", foreground: "200 25% 95%" },
  forest:  { key: "forest",  label: "Forest",  primary: "145 70% 42%", background: "150 25% 7%",  card: "150 20% 11%", foreground: "120 15% 95%" },
  sunset:  { key: "sunset",  label: "Sunset",  primary: "20 95% 55%",  background: "20 30% 7%",   card: "20 25% 11%",  foreground: "30 25% 95%" },
  rose:    { key: "rose",    label: "Rose",    primary: "340 85% 55%", background: "340 25% 8%",  card: "340 20% 12%", foreground: "340 15% 95%" },
  violet:  { key: "violet",  label: "Violet",  primary: "270 80% 60%", background: "270 30% 8%",  card: "270 25% 12%", foreground: "270 15% 95%" },
  crimson: { key: "crimson", label: "Crimson", primary: "0 80% 55%",   background: "0 30% 7%",    card: "0 25% 11%",   foreground: "0 15% 95%" },
  teal:    { key: "teal",    label: "Teal",    primary: "175 75% 42%", background: "180 30% 7%",  card: "180 25% 11%", foreground: "180 15% 95%" },
  amber:   { key: "amber",   label: "Amber",   primary: "38 95% 55%",  background: "30 25% 7%",   card: "30 20% 11%",  foreground: "40 25% 95%" },
  indigo:  { key: "indigo",  label: "Indigo",  primary: "230 80% 60%", background: "230 35% 8%",  card: "230 30% 12%", foreground: "230 15% 95%" },
  lime:    { key: "lime",    label: "Lime",    primary: "85 75% 50%",  background: "90 25% 7%",   card: "90 20% 11%",  foreground: "85 15% 95%" },
  magenta: { key: "magenta", label: "Magenta", primary: "310 85% 55%", background: "310 25% 8%",  card: "310 20% 12%", foreground: "310 15% 95%" },
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

// Font size is now a level 1..5 mapped to pixel sizes
const clampFont = (n: number) => Math.min(5, Math.max(1, Math.round(n)));
const FONT_LEVEL_PX: Record<number, number> = { 1: 14, 2: 16, 3: 18, 4: 20, 5: 22 };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("theme") as Theme) || "dark";
  });
  const [fontSize, setFontSizeState] = useState<number>(() => {
    if (typeof window === "undefined") return 3;
    const stored = Number(localStorage.getItem("app-font-size"));
    return clampFont(stored && stored <= 5 ? stored : 3);
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
    const px = FONT_LEVEL_PX[fontSize] || 18;
    document.documentElement.style.setProperty("--app-font-size", `${px}px`);
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
