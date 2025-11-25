import {
  Building2,
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  DollarSign,
  TrendingUp,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppSidebarProps {
  role: string;
  userEmail?: string;
  userName?: string;
}

export function AppSidebar({ role, userEmail, userName }: AppSidebarProps) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Manage Users", href: "/dashboard?tab=users" },
    {
      icon: FileText,
      label: "Review Listings",
      href: "/dashboard?tab=listings",
    },
    { icon: TrendingUp, label: "Analytics", href: "/dashboard?tab=analytics" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard?tab=messages" },
  ];

  const investorMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: TrendingUp, label: "Browse Opportunities", href: "/browse" },
    { icon: FileText, label: "My Offers", href: "/dashboard?tab=offers" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard?tab=messages" },
    {
      icon: DollarSign,
      label: "Transactions",
      href: "/dashboard?tab=transactions",
    },
  ];

  const sellerMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Building2, label: "My Listings", href: "/dashboard?tab=listings" },
    { icon: FileText, label: "Incoming Offers", href: "/dashboard?tab=offers" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard?tab=messages" },
    {
      icon: DollarSign,
      label: "Transactions",
      href: "/dashboard?tab=transactions",
    },
  ];

  const menuItems =
    role === "admin"
      ? adminMenuItems
      : role === "seller"
      ? sellerMenuItems
      : investorMenuItems;

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar shadow-md hover:bg-sidebar-accent transition-all",
          collapsed && "rotate-180"
        )}
      >
        <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
      </Button>

      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 transition-all"
        >
          <Building2 className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
          {!collapsed && (
            <span className="text-xl font-bold text-sidebar-foreground whitespace-nowrap">
              Scale & Sell
            </span>
          )}
        </Link>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all group",
              collapsed ? "justify-center px-2" : "justify-start"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium truncate">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="p-4 space-y-2">
        {!collapsed && (
          <div className="mb-3 px-2">
            <p className="text-xs text-sidebar-foreground/70 truncate font-medium">
              {userName || userEmail}
            </p>
            <p className="text-xs text-sidebar-primary font-semibold capitalize mt-0.5">
              {role}
            </p>
          </div>
        )}
        <ThemeToggle
          compact={collapsed}
          className={cn(
            "w-full mb-2",
            collapsed ? "justify-center px-2" : "justify-start"
          )}
        />
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            collapsed ? "justify-center px-2" : "justify-start"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-2 font-medium">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
