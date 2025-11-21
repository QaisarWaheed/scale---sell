import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, LayoutDashboard, MessageSquare, User } from "lucide-react";

interface DashboardHeaderProps {
  userEmail?: string;
  role: string;
  onSignOut: () => void;
}

export const DashboardHeader = ({
  userEmail,
  role,
  onSignOut,
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Scale & Sell
            </span>
          </Link>

          {/* Dashboard Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {role === "seller" && (
              <Link
                to="/dashboard?tab=listings"
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                <Building2 className="h-4 w-4" />
                My Listings
              </Link>
            )}

            <Link
              to="/dashboard?tab=messages"
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Messages
            </Link>

            <Link
              to="/dashboard?tab=profile"
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm">
              <p className="text-muted-foreground">{userEmail}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
            <Button variant="outline" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
