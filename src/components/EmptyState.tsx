import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "no-results" | "error";
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState - Enhanced empty state component
 * Supports multiple variants and actions for different scenarios
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  variant = "default",
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const iconColorClass = {
    default: "text-muted-foreground",
    "no-results": "text-primary",
    error: "text-destructive",
  }[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mb-6",
          variant === "error" ? "bg-destructive/10" : "bg-muted"
        )}
      >
        <Icon className={cn("h-10 w-10", iconColorClass)} />
      </div>
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex gap-3 justify-center">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
