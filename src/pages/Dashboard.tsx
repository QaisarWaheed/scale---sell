import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminDashboard from "./AdminDashboard";
import InvestorDashboard from "./InvestorDashboard";
import SellerDashboard from "./SellerDashboard";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("investor");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      // Fetch the role from the backend or use metadata
      // For now, we'll rely on metadata but sync it if needed
      setRole(session.user.user_metadata.role || "investor");
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
        setRole(session.user.user_metadata.role || "investor");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSwitchRole = async (newRole: string) => {
    try {
      // Call backend to update role
      await api.put("/users/role", { role: newRole });

      // Update local state
      setRole(newRole);

      // Update Supabase metadata (optional, but good for consistency)
      await supabase.auth.updateUser({
        data: { role: newRole },
      });

      toast.success(`Switched to ${newRole} view`);
    } catch (error) {
      console.error("Failed to switch role:", error);
      toast.error("Failed to switch role");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 capitalize">
                {role} Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Switch Role</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleSwitchRole("investor")}
                  >
                    Investor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSwitchRole("seller")}>
                    Seller
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSwitchRole("admin")}>
                    Admin
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {role === "admin" && <AdminDashboard />}
          {role === "investor" && <InvestorDashboard />}
          {role === "seller" && <SellerDashboard />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
