import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

const ThemeToggle = ({ size = "icon" }: { size?: "icon" | "sm" }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      size={size === "icon" ? "icon" : "sm"}
      variant="ghost"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="h-8 w-8"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
};

export default ThemeToggle;
