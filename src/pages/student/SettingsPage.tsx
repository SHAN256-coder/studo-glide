import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Sun, Moon, Type, Volume2, VolumeX, Sparkles, LayoutGrid, RotateCcw,
} from "lucide-react";

const FONT_PRESETS = [12, 14, 16, 18, 20, 22];

const SettingsPage = () => {
  const {
    theme, toggleTheme,
    fontSize, setFontSize,
    reducedMotion, setReducedMotion,
    compactMode, setCompactMode,
  } = useTheme();
  const { soundEnabled, toggleSound } = useAppContext();

  const reset = () => {
    setFontSize(16);
    setReducedMotion(false);
    setCompactMode(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">Settings</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Customize appearance and behavior</p>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          {theme === "dark" ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
          <h3 className="font-semibold text-card-foreground">Theme</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => theme !== "light" && toggleTheme()}
            className={`p-3 rounded-lg border-2 transition-all ${theme === "light" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
          >
            <Sun size={20} className="mx-auto mb-1" />
            <p className="text-xs font-semibold">Light · Ink Blue</p>
          </button>
          <button
            onClick={() => theme !== "dark" && toggleTheme()}
            className={`p-3 rounded-lg border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
          >
            <Moon size={20} className="mx-auto mb-1" />
            <p className="text-xs font-semibold">Dark · Yellow & Black</p>
          </button>
        </div>
      </motion.div>

      {/* Font Size */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Type size={18} className="text-primary" />
            <h3 className="font-semibold text-card-foreground">Font Size</h3>
          </div>
          <span className="text-sm font-mono font-bold text-primary">{fontSize}px</span>
        </div>
        <Slider
          value={[fontSize]}
          min={12}
          max={22}
          step={1}
          onValueChange={(v) => setFontSize(v[0])}
        />
        <div className="flex flex-wrap gap-2">
          {FONT_PRESETS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={fontSize === s ? "default" : "outline"}
              onClick={() => setFontSize(s)}
              className="text-xs h-7"
            >
              {s}px
            </Button>
          ))}
        </div>
        <p style={{ fontSize: `${fontSize}px` }} className="text-card-foreground border-t border-border pt-3">
          Aa — Preview text at the chosen size.
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
