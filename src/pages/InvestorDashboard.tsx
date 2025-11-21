import { useSearchParams, Link } from "react-router-dom";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { Building2, Heart, MessageSquare, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import MyOffersPage from "./investor/MyOffersPage";
import MessagesPage from "./MessagesPage";
import TransactionsPage from "./TransactionsPage";
import { useEffect, useState } from "react";
import { getTransactions } from "@/lib/transactionApi";
import { getThreads } from "@/lib/messageApi";
import { getListings } from "@/lib/listingApi";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function InvestorDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  const [stats, setStats] = useState({
    activeOffers: 0,
    activeDeals: 0,
    messages: 0,
    savedListings: 0, // Placeholder for now
  });
  const [recommendedListings, setRecommendedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const [transactions, threads, listings] = await Promise.all([
          getTransactions(),
          getThreads(),
          getListings(),
        ]);

        // Calculate Active Offers (buyer, status pending/negotiation)
        const activeOffersCount = transactions.filter(
          (t: any) =>
            t.buyerId._id === user.id &&
            ["pending", "negotiation"].includes(t.status)
        ).length;

        // Calculate Active Deals (buyer, status in_progress)
        const activeDealsCount = transactions.filter(
          (t: any) => t.buyerId._id === user.id && t.status === "in_progress"
        ).length;

        // Calculate Messages (total threads for now)
        const messagesCount = threads.length;

        setStats({
          activeOffers: activeOffersCount,
          activeDeals: activeDealsCount,
          messages: messagesCount,
          savedListings: 0,
        });

        // Get Recommended Opportunities (top 3 active listings, excluding own if any)
        // Simple logic: just take first 3 for now
        setRecommendedListings(listings.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render specific tab content
  if (tab === "offers") return <MyOffersPage />;
  if (tab === "messages") return <MessagesPage />;
  if (tab === "transactions") return <TransactionsPage />;

  // Default dashboard overview
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader
          title="Investment Overview"
          subtitle="Track your investment opportunities"
        />
        <div className="grid md:grid-cols-4 gap-6">
          <StatsCard
            title="Saved Listings"
            value={stats.savedListings.toString()}
            icon={Heart}
            subtitle="Opportunities tracked"
          />
          <StatsCard
            title="Active Offers"
            value={stats.activeOffers.toString()}
            icon={DollarSign}
            subtitle="Pending responses"
          />
          <StatsCard
            title="Active Deals"
            value={stats.activeDeals.toString()}
            icon={Building2}
            subtitle="In progress"
          />
          <StatsCard
            title="Messages"
            value={stats.messages.toString()}
            icon={MessageSquare}
            subtitle="Active conversations"
          />
        </div>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <h3 className="font-semibold mb-4">Recommended Opportunities</h3>
        <div className="space-y-4">
          {recommendedListings.length > 0 ? (
            recommendedListings.map((listing: any) => (
              <div
                key={listing._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{listing.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {listing.category} •{" "}
                    {formatCurrency(listing.financials.revenue)} Revenue
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary mb-1">
                    {formatCurrency(listing.financials.askingPrice)}
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/browse`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              No recommendations available at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
