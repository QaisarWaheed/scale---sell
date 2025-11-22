import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size={compact ? "icon" : "default"}
      onClick={toggleTheme}
      className={cn(
        "transition-all duration-300 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
    >
      {theme === "light" ? (
        <>
          <Moon className={cn("h-5 w-5", !compact && "mr-2")} />
          {!compact && <span className="text-sm font-medium">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className={cn("h-5 w-5", !compact && "mr-2")} />
          {!compact && <span className="text-sm font-medium">Light Mode</span>}
        </>
      )}
    </Button>
  );
}
