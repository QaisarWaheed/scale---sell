import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Menu } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Scale & Sell
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/browse" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Browse Listings
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="premium" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in">
            <Link to="/browse" className="block text-sm font-medium text-foreground/80 hover:text-foreground py-2">
              Browse Listings
            </Link>
            <Link to="/how-it-works" className="block text-sm font-medium text-foreground/80 hover:text-foreground py-2">
              How It Works
            </Link>
            <Link to="/about" className="block text-sm font-medium text-foreground/80 hover:text-foreground py-2">
              About
            </Link>
            <Link to="/contact" className="block text-sm font-medium text-foreground/80 hover:text-foreground py-2">
              Contact
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="ghost" asChild className="w-full">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="premium" asChild className="w-full">
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
