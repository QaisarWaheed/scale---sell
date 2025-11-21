import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  children: React.ReactNode;
  resultsCount?: number;
  onClearFilters?: () => void;
  showMoreFilters?: boolean;
  onMoreFilters?: () => void;
  className?: string;
}

/**
 * FilterPanel - Reusable filter panel component
 * Provides consistent filter UI with clear and more options
 */
export function FilterPanel({
  children,
  resultsCount,
  onClearFilters,
  showMoreFilters = false,
  onMoreFilters,
  className,
}: FilterPanelProps) {
  return (
    <div className={cn("bg-card rounded-lg border shadow-sm p-6", className)}>
      <div className="space-y-4">
        {children}

        <div className="flex items-center gap-2 pt-2">
          {showMoreFilters && onMoreFilters && (
            <Button variant="outline" size="sm" onClick={onMoreFilters}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          )}

          {onClearFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}

          {resultsCount !== undefined && (
            <div className="ml-auto text-sm text-muted-foreground">
              {resultsCount} {resultsCount === 1 ? "result" : "results"} found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
