import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
  variant?: "default" | "gradient" | "outline";
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className,
  variant = "default",
}: StatsCardProps) {
  const variants = {
    default: "bg-card hover:shadow-md border-border/50",
    gradient:
      "bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20",
    outline:
      "bg-transparent border-dashed hover:border-solid hover:bg-muted/50",
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 overflow-hidden relative group",
        variants[variant],
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-full",
            variant === "gradient" ? "bg-primary/20" : "bg-muted"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              variant === "gradient" ? "text-primary" : "text-foreground"
            )}
          />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                trend.positive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
