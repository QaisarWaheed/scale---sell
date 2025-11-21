import { useSearchParams } from "react-router-dom";
import { StatsCard } from "@/components/StatsCard";
import { Users, FileText, DollarSign, TrendingUp } from "lucide-react";
import ManageUsersPage from "./admin/ManageUsersPage";
import ReviewListingsPage from "./admin/ReviewListingsPage";
import AdminAnalyticsPage from "./admin/AdminAnalyticsPage";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  // Render specific tab content
  if (tab === "users") return <ManageUsersPage />;
  if (tab === "listings") return <ReviewListingsPage />;
  if (tab === "analytics") return <AdminAnalyticsPage />;

  // Default dashboard overview
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value="247"
            icon={Users}
            subtitle="Active platform members"
            trend={{ value: "12% from last month", positive: true }}
          />
          <StatsCard
            title="Active Listings"
            value="56"
            icon={FileText}
            subtitle="Published businesses"
            trend={{ value: "8% from last month", positive: true }}
          />
          <StatsCard
            title="Total Transactions"
            value="$2.5M"
            icon={DollarSign}
            subtitle="All-time volume"
            trend={{ value: "23% from last month", positive: true }}
          />
          <StatsCard
            title="Monthly Growth"
            value="+23%"
            icon={TrendingUp}
            subtitle="New users this month"
            trend={{ value: "5% increase", positive: true }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>New user registered: john@example.com</span>
              <span className="ml-auto text-muted-foreground">2h ago</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Listing approved: SaaS Analytics Platform</span>
              <span className="ml-auto text-muted-foreground">5h ago</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Transaction completed: $350k</span>
              <span className="ml-auto text-muted-foreground">1d ago</span>
            </li>
          </ul>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="font-semibold mb-4">Pending Actions</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>8 listings awaiting review</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>3 user reports to investigate</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>2 support tickets open</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
