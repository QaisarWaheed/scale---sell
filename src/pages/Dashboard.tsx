import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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

  if (loading) {
    return <LoadingSpinner centered text="Loading dashboard..." />;
  }

  return (
    <DashboardLayout
      role={role}
      userEmail={user?.email}
      title={`${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`}
      subtitle={`Welcome back, ${user?.email}`}
    >
      {role === "admin" && <AdminDashboard />}
      {role === "investor" && <InvestorDashboard />}
      {role === "seller" && <SellerDashboard />}
    </DashboardLayout>
  );
}
