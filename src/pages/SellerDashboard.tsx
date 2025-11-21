import { useSearchParams } from "react-router-dom";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { Building2, Eye, TrendingUp, MessageSquare } from "lucide-react";
import MyListingsPage from "./seller/MyListingsPage";
import MessagesPage from "./MessagesPage";
import TransactionsPage from "./TransactionsPage";
import { useEffect, useState } from "react";
import { getMyListings } from "@/lib/listingApi";
import { getThreads } from "@/lib/messageApi";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function SellerDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  const [stats, setStats] = useState({
    myListings: 0,
    totalViews: 0,
    inquiries: 0,
    performance: "0%",
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listings, threads] = await Promise.all([
          getMyListings(),
          getThreads(),
        ]);

        // Calculate My Listings
        const listingsCount = listings.length;

        // Calculate Total Views (sum of views from all listings)
        const viewsCount = listings.reduce(
          (acc: number, curr: any) => acc + (curr.views || 0),
          0
        );

        // Calculate Inquiries (total threads)
        const inquiriesCount = threads.length;

        // Calculate Performance (simple metric: % of listings with > 0 views)
        const activeListings = listings.filter(
          (l: any) => (l.views || 0) > 0
        ).length;
        const performanceScore =
          listingsCount > 0
            ? Math.round((activeListings / listingsCount) * 100)
            : 0;

        setStats({
          myListings: listingsCount,
          totalViews: viewsCount,
          inquiries: inquiriesCount,
          performance: `${performanceScore}%`,
        });

        // Generate Recent Activity from listings (e.g. newly created)
        // This is a simplified version. Ideally we'd have an activity log endpoint.
        const activity = listings.slice(0, 3).map((l: any) => ({
          type: "listing",
          message: `Listing "${l.title}" is active`,
          time: new Date(l.createdAt).toLocaleDateString(),
          color: "bg-blue-500",
        }));
        setRecentActivity(activity);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render specific tab content
  if (tab === "listings") return <MyListingsPage />;
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
          title="Seller Overview"
          subtitle="Monitor your business listings"
        />
        <div className="grid md:grid-cols-4 gap-6">
          <StatsCard
            title="My Listings"
            value={stats.myListings.toString()}
            icon={Building2}
            subtitle="Active businesses"
          />
          <StatsCard
            title="Total Views"
            value={stats.totalViews.toString()}
            icon={Eye}
            subtitle="All listings"
            // trend={{ value: "18% from last week", positive: true }}
          />
          <StatsCard
            title="Inquiries"
            value={stats.inquiries.toString()}
            icon={MessageSquare}
            subtitle="From interested buyers"
          />
          <StatsCard
            title="Performance"
            value={stats.performance}
            icon={TrendingUp}
            subtitle="Listing quality score"
          />
        </div>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <ul className="space-y-3 text-sm">
          {recentActivity.length > 0 ? (
            recentActivity.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                <span>{item.message}</span>
                <span className="ml-auto text-muted-foreground">
                  {item.time}
                </span>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground">No recent activity</li>
          )}
        </ul>
      </div>
    </div>
  );
}
