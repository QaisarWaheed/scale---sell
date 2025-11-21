import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "grid" | "table";
  count?: number;
  className?: string;
}

/**
 * LoadingSkeleton - Skeleton loader for different content types
 * Provides consistent loading placeholders
 */
export function LoadingSkeleton({
  variant = "card",
  count = 3,
  className,
}: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div
        className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-6", className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg border shadow-sm h-96 animate-pulse"
          >
            <div className="aspect-video w-full bg-muted rounded-t-lg" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-10 bg-muted rounded flex-1" />
            <div className="h-10 bg-muted rounded flex-1" />
            <div className="h-10 bg-muted rounded flex-1" />
          </div>
        ))}
      </div>
    );
  }

  // grid variant
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
          <div className="h-20 bg-muted rounded mb-3" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}
