import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * PageContainer - Consistent container component for page content
 * Provides standard max-width and padding
 */
export function PageContainer({
  children,
  className,
  fullWidth = false,
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto px-4", !fullWidth && "container", className)}>
      {children}
    </div>
  );
}
