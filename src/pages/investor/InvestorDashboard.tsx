import { useSearchParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import {
  Building2,
  Heart,
  MessageSquare,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MyOffersPage from "./MyOffersPage";
import MessagesPage from "../MessagesPage";
import TransactionsPage from "../TransactionsPage";
import InvestmentsPage from "./InvestmentsPage";
import { useEffect, useState } from "react";
import { getTransactions, EscrowTransaction } from "@/lib/escrowApi";
import { getThreads } from "@/lib/messageApi";
import { getListings } from "@/lib/listingApi";
import { getSavedListings } from "@/lib/userApi";
import { investmentApi } from "@/lib/investmentApi";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { BusinessListing } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

export default function InvestorDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const { formatAmount } = useCurrency();

  const [stats, setStats] = useState({
    activeOffers: 0,
    activeDeals: 0,
    messages: 0,
    savedListings: 0,
    investments: 0,
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

        const [transactions, threads, listings, saved, investments] =
          await Promise.all([
            getTransactions(),
            getThreads(),
            getListings(),
            getSavedListings(),
            investmentApi.getInvestorInvestments(),
          ]);

        // Calculate Active Offers (buyer, status pending)
        const activeOffersCount = transactions.filter(
          (t: EscrowTransaction) => {
            return (
              (typeof t.buyerId === "object" ? t.buyerId._id : t.buyerId) ===
                user.id && t.status === "pending"
            );
          }
        ).length;

        // Calculate Active Deals (buyer, status holding or released)
        const activeDealsCount = transactions.filter((t: EscrowTransaction) => {
          const buyerId =
            typeof t.buyerId === "object" ? t.buyerId._id : t.buyerId;
          return (
            buyerId === user.id && ["holding", "released"].includes(t.status)
          );
        }).length;

        // Calculate Messages (total threads for now)
        const messagesCount = threads.length;

        setStats({
          activeOffers: activeOffersCount,
          activeDeals: activeDealsCount,
          messages: messagesCount,
          savedListings: saved.length,
          investments: investments.length,
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
  if (tab === "investments") return <InvestmentsPage />;
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
                    {formatAmount(listing.financials.revenue)} Revenue
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary mb-1">
                    {formatAmount(listing.financials.askingPrice)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/dashboard?tab=investments">
            <StatsCard
              title="Total Investments"
              value={stats.investments.toString()}
              icon={Briefcase}
              subtitle="Active portfolio items"
              className="h-full cursor-pointer hover:border-primary/50 transition-colors"
            />
          </Link>

          <Link to="/dashboard?tab=saved">
            <StatsCard
              title="Saved Listings"
              value={stats.savedListings.toString()}
              icon={Heart}
              subtitle="Opportunities tracked"
              className="h-full cursor-pointer hover:border-primary/50 transition-colors"
            />
          </Link>

          <StatsCard
            title="Active Offers"
            value={stats.activeOffers.toString()}
            icon={DollarSign}
            subtitle="Pending responses"
            className="h-full"
          />

          <StatsCard
            title="Messages"
            value={stats.messages.toString()}
            icon={MessageSquare}
            subtitle="Active conversations"
            className="h-full"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recommended Opportunities</h3>
            <Button variant="ghost" asChild size="sm">
              <Link to="/browse">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedListings.length > 0 ? (
              recommendedListings.map((listing: BusinessListing) => (
                <Card
                  key={listing._id}
                  className="hover:shadow-md transition-shadow flex flex-col"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {listing.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50 text-xs"
                      >
                        {formatAmount(listing.financials.askingPrice)}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-1">
                      {listing.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>Revenue</span>
                        <span className="font-medium text-foreground">
                          {formatAmount(listing.financials.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit</span>
                        <span className="font-medium text-foreground">
                          {formatAmount(listing.financials.profit)}
                        </span>
                      </div>
                    </div>
                    <Button className="w-full" size="sm" asChild>
                      <Link to={`/listing/${listing._id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">
                  No recommendations available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link to="/browse">
                  <Building2 className="mr-2 h-4 w-4" />
                  Browse Listings
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link to="/dashboard?tab=messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Check Messages
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link to="/dashboard?tab=investments">
                  <Briefcase className="mr-2 h-4 w-4" />
                  My Portfolio
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold mb-4">Active Deals</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">
                {stats.activeDeals} deals in progress
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Check your transactions tab for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
