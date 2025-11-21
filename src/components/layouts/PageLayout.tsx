import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted";
}

/**
 * PageLayout - Wrapper component for all public pages
 * Automatically includes Header and Footer with consistent structure
 */
export function PageLayout({
  children,
  className,
  variant = "default",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        className={cn(
          "flex-1",
          variant === "muted" && "bg-muted/30",
          className
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
