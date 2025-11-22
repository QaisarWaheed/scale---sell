import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  userEmail?: string;
  userName?: string;
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
  userName,
  title,
  subtitle,
  className,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar role={role} userEmail={userEmail} userName={userName} />

      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className={cn("container mx-auto p-6 md:p-8", className)}>
          {(title || subtitle) && (
            <div className="mb-6 md:mb-8">
              {title && (
                <h1 className="text-2xl md:text-3xl font-bold mb-2 capitalize text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm md:text-base text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
