import { useSearchParams, Link } from "react-router-dom";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { Building2, Heart, MessageSquare, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import MyOffersPage from "./MyOffersPage";
import MessagesPage from "../MessagesPage";
import TransactionsPage from "../TransactionsPage";
import { useEffect, useState } from "react";
import { getTransactions } from "@/lib/transactionApi";
import { getThreads } from "@/lib/messageApi";
import { getListings } from "@/lib/listingApi";
import { getSavedListings } from "@/lib/userApi";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Offer, BusinessListing } from "@/types";

export default function InvestorDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  const [stats, setStats] = useState({
    activeOffers: 0,
    activeDeals: 0,
    messages: 0,
    savedListings: 0,
  });
  const [recommendedListings, setRecommendedListings] = useState<
    BusinessListing[]
  >([]);
  const [savedListingsData, setSavedListingsData] = useState<BusinessListing[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const [transactions, threads, listings, saved] = await Promise.all([
          getTransactions(),
          getThreads(),
          getListings(),
          getSavedListings(),
        ]);

        // Calculate Active Offers (buyer, status pending/negotiation)
        const activeOffersCount = transactions.filter((t: Offer) => {
          return (
            (typeof t.buyerId === "object" ? t.buyerId._id : t.buyerId) ===
              user.id && ["pending", "negotiation"].includes(t.status)
          );
        }).length;

        // Calculate Active Deals (buyer, status in_progress)
        const activeDealsCount = transactions.filter((t: Offer) => {
          const buyerId =
            typeof t.buyerId === "object" ? t.buyerId._id : t.buyerId;
          return buyerId === user.id && t.status === "in_progress";
        }).length;

        // Calculate Messages (total threads for now)
        const messagesCount = threads.length;

        setStats({
          activeOffers: activeOffersCount,
          activeDeals: activeDealsCount,
          messages: messagesCount,
          savedListings: saved.length,
        });

        setSavedListingsData(saved);

        // Get Recommended Opportunities (top 3 active listings, excluding own if any)
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
  if (tab === "saved") {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Saved Listings"
          subtitle="Your bookmarked opportunities"
        />
        {loading ? (
          <LoadingSkeleton variant="list" count={3} />
        ) : savedListingsData.length > 0 ? (
          <div className="grid gap-4">
            {savedListingsData.map((listing) => (
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
                    <Link to={`/listing/${listing._id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved listings</h3>
            <p className="text-muted-foreground mb-4">
              Start browsing to find opportunities you like.
            </p>
            <Button asChild>
              <Link to="/browse">Browse Listings</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="mb-6 space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <LoadingSkeleton variant="grid" count={4} />
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <div className="h-6 w-48 bg-muted rounded mb-4 animate-pulse" />
          <LoadingSkeleton variant="list" count={3} />
        </div>
      </div>
    );
  }

  // Default dashboard overview
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader
          title="Investment Overview"
          subtitle="Track your investment opportunities"
        />
        <div className="grid md:grid-cols-4 gap-6">
          <Link to="/dashboard?tab=saved">
            <StatsCard
              title="Saved Listings"
              value={stats.savedListings.toString()}
              icon={Heart}
              subtitle="Opportunities tracked"
              className="hover:border-primary/50 transition-colors cursor-pointer"
            />
          </Link>
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
            recommendedListings.map((listing: BusinessListing) => (
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
                    <Link to={`/listing/${listing._id}`}>View Details</Link>
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
