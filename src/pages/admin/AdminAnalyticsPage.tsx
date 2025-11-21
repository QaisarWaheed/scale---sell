import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { Users, Building2, DollarSign, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSystemStats } from "@/lib/adminApi";

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getSystemStats();
      setStats(data);
    } catch (error: any) {
      toast({
        title: "Error fetching stats",
        description:
          error.response?.data?.message || "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Analytics"
        subtitle="Platform performance and insights"
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading analytics...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
          />
          <StatsCard
            title="Total Listings"
            value={stats.totalListings}
            icon={Building2}
          />
          <StatsCard
            title="Active Listings"
            value={stats.activeListings}
            icon={Activity}
          />
          <StatsCard
            title="Total Volume"
            value={stats.totalVolume}
            icon={DollarSign}
            prefix="$"
          />
        </div>
      )}
    </div>
  );
}
