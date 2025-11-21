import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminDashboard from "./AdminDashboard";
import InvestorDashboard from "./InvestorDashboard";
import SellerDashboard from "./SellerDashboard";

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
      // Get role from user metadata
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <DashboardHeader
        userEmail={user?.email}
        role={role}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 capitalize">
              {role} Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>

          {role === "admin" && <AdminDashboard />}
          {role === "investor" && <InvestorDashboard />}
          {role === "seller" && <SellerDashboard />}
        </div>
      </main>
    </div>
  );
}
