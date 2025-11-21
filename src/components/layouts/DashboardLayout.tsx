import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  userEmail?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * DashboardLayout - Wrapper component for all dashboard pages
 * Automatically includes AppSidebar with role-based navigation
 */
export function DashboardLayout({
  children,
  role,
  userEmail,
  title,
  subtitle,
  className,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar role={role} userEmail={userEmail} />

      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className={cn("container mx-auto p-8", className)}>
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-3xl font-bold mb-2 capitalize">{title}</h1>
              )}
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
