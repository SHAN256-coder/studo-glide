import { motion } from "framer-motion";
import { useTheme, THEME_PRESETS, ThemePresetKey } from "@/contexts/ThemeContext";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Sun, Moon, Type, Volume2, VolumeX, Sparkles, LayoutGrid, RotateCcw, Palette,
} from "lucide-react";

// Convert HSL string "H S% L%" to hex for color input
function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.replace(/%/g, "").split(/\s+/).map(Number);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const SettingsPage = () => {
  const {
    theme, toggleTheme,
    fontSize, setFontSize,
    reducedMotion, setReducedMotion,
    compactMode, setCompactMode,
    themePreset, setThemePreset,
    customPrimary, setCustomPrimary,
  } = useTheme();
  const { soundEnabled, toggleSound } = useAppContext();

  const reset = () => {
    setFontSize(3);
    setReducedMotion(false);
    setCompactMode(false);
    setThemePreset("default");
  };

  const presetSwatches: { key: ThemePresetKey; label: string; color: string }[] = (
    Object.keys(THEME_PRESETS) as Array<keyof typeof THEME_PRESETS>
  ).map((k) => ({ key: k, label: THEME_PRESETS[k].label, color: `hsl(${THEME_PRESETS[k].primary})` }));

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">Settings</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Customize appearance and behavior</p>
      </motion.div>

      {/* Theme mode */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          {theme === "dark" ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
          <h3 className="font-semibold text-card-foreground">Theme Mode</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => theme !== "light" && toggleTheme()}
            className={`p-3 rounded-lg border-2 transition-all ${theme === "light" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
          >
            <Sun size={20} className="mx-auto mb-1" />
            <p className="text-xs font-semibold">Light</p>
          </button>
          <button
            onClick={() => theme !== "dark" && toggleTheme()}
            className={`p-3 rounded-lg border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
          >
            <Moon size={20} className="mx-auto mb-1" />
            <p className="text-xs font-semibold">Dark</p>
          </button>
        </div>
      </motion.div>

      {/* Theme color presets */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Palette size={18} className="text-primary" />
          <h3 className="font-semibold text-card-foreground">Color Theme</h3>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-2">Pick one of 12 presets, or build your own.</p>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {presetSwatches.map((s) => (
            <button
              key={s.key}
              onClick={() => setThemePreset(s.key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${themePreset === s.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
            >
              <span className="w-7 h-7 rounded-full border border-border" style={{ background: s.color }} />
              <span className="text-[10px] font-medium truncate max-w-full">{s.label}</span>
            </button>
          ))}
        </div>

        <div className={`p-3 rounded-lg border-2 ${themePreset === "custom" ? "border-primary bg-primary/10" : "border-border"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full border border-border" style={{ background: `hsl(${customPrimary})` }} />
              <div>
                <p className="text-sm font-semibold">Custom Color</p>
                <p className="text-[10px] text-muted-foreground">6th — Pick any color</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={hslToHex(customPrimary)}
                onChange={(e) => { setCustomPrimary(hexToHsl(e.target.value)); setThemePreset("custom"); }}
                className="h-9 w-12 p-1 cursor-pointer"
              />
              <Button size="sm" variant={themePreset === "custom" ? "default" : "outline"} onClick={() => setThemePreset("custom")}>
                Use
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Font Size — slider 1..5 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Type size={18} className="text-primary" />
            <h3 className="font-semibold text-card-foreground">Font Size</h3>
          </div>
          <span className="text-sm font-mono font-bold text-primary">Level {fontSize}</span>
        </div>
        <Slider
          value={[fontSize]}
          min={1}
          max={5}
          step={1}
          onValueChange={(v) => setFontSize(v[0])}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        </div>
        <p className="text-card-foreground border-t border-border pt-3 leading-tight">
          Aa — Preview at level {fontSize}
        </p>
      </motion.div>

      {/* App Customisation */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="font-semibold text-card-foreground">App Customisation</h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <div>
              <p className="text-sm font-medium">Tap Sounds</p>
              <p className="text-[11px] text-muted-foreground">Subtle feedback on interactions</p>
            </div>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={16} />
            <div>
              <p className="text-sm font-medium">Reduce Motion</p>
              <p className="text-[11px] text-muted-foreground">Minimise animations</p>
            </div>
          </div>
          <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid size={16} />
            <div>
              <p className="text-sm font-medium">Compact Mode</p>
              <p className="text-[11px] text-muted-foreground">Tighter spacing for dense views</p>
            </div>
          </div>
          <Switch checked={compactMode} onCheckedChange={setCompactMode} />
        </div>

        <Button variant="outline" size="sm" onClick={reset} className="gap-2">
          <RotateCcw size={14} /> Reset to defaults
        </Button>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
