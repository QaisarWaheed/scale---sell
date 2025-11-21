import { useSearchParams } from "react-router-dom";
import { StatsCard } from "@/components/StatsCard";
import { Building2, Eye, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import MyListingsPage from "./seller/MyListingsPage";
import MessagesPage from "./MessagesPage";
import TransactionsPage from "./TransactionsPage";

export default function SellerDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  // Render specific tab content
  if (tab === "listings") return <MyListingsPage />;
  if (tab === "messages") return <MessagesPage />;
  if (tab === "transactions") return <TransactionsPage />;

  // Default dashboard overview
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Seller Overview</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <StatsCard
            title="My Listings"
            value="2"
            icon={Building2}
            subtitle="Active businesses"
          />
          <StatsCard
            title="Total Views"
            value="434"
            icon={Eye}
            subtitle="All listings"
            trend={{ value: "18% from last week", positive: true }}
          />
          <StatsCard
            title="Inquiries"
            value="20"
            icon={MessageSquare}
            subtitle="From interested buyers"
          />
          <StatsCard
            title="Performance"
            value="89%"
            icon={TrendingUp}
            subtitle="Listing quality score"
          />
        </div>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>New inquiry on "SaaS Analytics Platform"</span>
            <span className="ml-auto text-muted-foreground">2h ago</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Listing viewed 12 times today</span>
            <span className="ml-auto text-muted-foreground">Today</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Offer received: $320k</span>
            <span className="ml-auto text-muted-foreground">1d ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
