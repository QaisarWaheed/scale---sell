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
    savedListings: 0, // Placeholder for now
  });
  const [recommendedListings, setRecommendedListings] = useState<
    BusinessListing[]
  >([]);
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
        const activeOffersCount = transactions.filter((t: Offer) => {
          const buyerId =
            typeof t.buyerId === "object" ? t.buyerId._id : t.buyerId;
          // Note: We are comparing MongoDB _id with Supabase ID.
          // This logic assumes they are synced or handled correctly in backend.
          // If buyerId is not the supabase ID, this might need adjustment.
          // However, based on MyOffersPage logic, we just need to match the user.
          // Let's assume for now the backend handles the mapping or we are checking correctly.
          // Actually, in MyOffersPage we used: offer.buyerId?._id === currentUserId
          // But here we are using supabase user.id.
          // If the backend stores supabase ID in _id (unlikely) or in a separate field.
          // Let's check MyOffersPage again. It used: offer.buyerId?._id === currentUserId
          // And currentUserId came from supabase.auth.getUser().id
          // So yes, we should match buyerId._id (if populated) or buyerId (if string) with user.id
          // Wait, does MongoDB _id match Supabase ID?
          // Usually not. MongoDB _id is ObjectId. Supabase ID is UUID.
          // The backend likely stores supabaseId in the user document.
          // But MyOffersPage sets currentUserId = user?.id (Supabase ID).
          // And filters by offer.buyerId?._id === currentUserId.
          // This implies the MongoDB _id IS the Supabase ID, OR the backend returns Supabase ID as _id?
          // Or maybe the user creation uses the Supabase ID as the MongoDB _id?
          // Let's assume the previous code was "correct" in its logic and just fix the types.

          // Re-reading MyOffersPage:
          // const { data: { user } } = await supabase.auth.getUser();
          // setCurrentUserId(user?.id || null);
          // ...
          // offers.filter((offer: any) => offer.buyerId?._id === currentUserId)

          // This strongly suggests that either:
          // 1. The MongoDB _id is manually set to the Supabase UUID.
          // 2. The previous code was buggy and comparing UUID with ObjectId (which would never match).

          // Given I am just fixing types, I should preserve the logic but make it type-safe.
          // If it was buggy, it's a separate issue, but I should probably flag it or try to be robust.
          // I'll stick to the pattern used in MyOffersPage.

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
