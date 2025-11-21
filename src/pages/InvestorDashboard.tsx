import { useSearchParams } from "react-router-dom";
import { StatsCard } from "@/components/StatsCard";
import { Building2, Heart, MessageSquare, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import MyOffersPage from "./investor/MyOffersPage";
import MessagesPage from "./MessagesPage";
import TransactionsPage from "./TransactionsPage";

export default function InvestorDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  // Render specific tab content
  if (tab === "offers") return <MyOffersPage />;
  if (tab === "messages") return <MessagesPage />;
  if (tab === "transactions") return <TransactionsPage />;

  // Default dashboard overview
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Investment Overview</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <StatsCard
            title="Saved Listings"
            value="12"
            icon={Heart}
            subtitle="Opportunities tracked"
          />
          <StatsCard
            title="Active Offers"
            value="3"
            icon={DollarSign}
            subtitle="Pending responses"
          />
          <StatsCard
            title="Active Deals"
            value="1"
            icon={Building2}
            subtitle="In progress"
          />
          <StatsCard
            title="Messages"
            value="8"
            icon={MessageSquare}
            subtitle="Unread conversations"
          />
        </div>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <h3 className="font-semibold mb-4">Recommended Opportunities</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold mb-1">High Growth SaaS {i}</h4>
                <p className="text-sm text-muted-foreground">
                  Tech • $1.2M ARR
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary mb-1">
                  ${i * 100}k
                </div>
                <Button size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
