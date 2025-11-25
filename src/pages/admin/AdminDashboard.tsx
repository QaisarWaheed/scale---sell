import { useSearchParams, Link } from "react-router-dom";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { Users, FileText, DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import ManageUsersPage from "./ManageUsersPage";
import ReviewListingsPage from "./ReviewListingsPage";
import AdminAnalyticsPage from "./AdminAnalyticsPage";
import MessagesPage from "../MessagesPage";
import TransactionsPage from "../TransactionsPage";
import CommissionsPage from "./CommissionsPage";
import { getAllUsers, getAllListings, getSystemStats } from "@/lib/adminApi";
import { commissionApi } from "@/lib/commissionApi";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { User, BusinessListing } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const { formatAmount } = useCurrency();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    totalTransactions: 0,
    monthlyGrowth: "0%",
    totalRevenue: 0,
  });
  const [pendingActions, setPendingActions] = useState({
    listingsReview: 0,
    userReports: 0,
    supportTickets: 0,
  });
  const [recentActivity, setRecentActivity] = useState<
    { message: string; time: string; color: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, listings, systemStats, commissionStats] =
          await Promise.all([
            getAllUsers(),
            getAllListings(),
            getSystemStats(),
            commissionApi.getTotal(),
          ]);

        // Calculate Total Users
        const usersCount = users.length;

        // Calculate Active Listings (status = approved)
        const activeListingsCount = listings.filter(
          (l: BusinessListing) => l.status === "approved"
        ).length;

        // Calculate Monthly Growth (users created this month)
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const newUsersCount = users.filter((u: User) => {
          const d = new Date(u.createdAt);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;
        const growth =
          usersCount > 0
            ? Math.round((newUsersCount / usersCount) * 100) + "%"
            : "0%";

        setStats({
          totalUsers: usersCount,
          activeListings: activeListingsCount,
          totalTransactions: systemStats.totalVolume || 0,
          monthlyGrowth: growth,
          totalRevenue: commissionStats.totalCollected,
        });

        setPendingActions({
          listingsReview: 0,
          userReports: 0,
          supportTickets: 0,
        });

        // Generate Recent Activity (mix of new users and listings)
        const recentUsers = users.slice(0, 2).map((u: User) => ({
          message: `New user registered: ${u.email}`,
          time: new Date(u.createdAt).toLocaleDateString(),
          color: "bg-green-500",
        }));
        const recentListings = listings
          .slice(0, 2)
          .map((l: BusinessListing) => ({
            message: `Listing ${l.status}: ${l.title}`,
            time: new Date(l.createdAt).toLocaleDateString(),
            color: "bg-blue-500",
          }));

        setRecentActivity([...recentUsers, ...recentListings].slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render specific tab content
  if (tab === "users") return <ManageUsersPage />;
  if (tab === "listings") return <ReviewListingsPage />;
  if (tab === "analytics") return <AdminAnalyticsPage />;
  if (tab === "messages") return <MessagesPage />;
  if (tab === "transactions") return <TransactionsPage />;
  if (tab === "commissions") return <CommissionsPage />;

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
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg bg-card">
            <div className="h-6 w-48 bg-muted rounded mb-4 animate-pulse" />
            <LoadingSkeleton variant="list" count={3} />
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <div className="h-6 w-48 bg-muted rounded mb-4 animate-pulse" />
            <LoadingSkeleton variant="list" count={3} />
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard overview
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader
          title="Platform Overview"
          subtitle="Monitor your platform's performance"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <Link to="/dashboard?tab=commissions">
              <StatsCard
                title="Total Revenue"
                value={formatAmount(stats.totalRevenue)}
                icon={DollarSign}
                subtitle="Platform commissions"
                className="h-full hover:border-primary/50 transition-colors cursor-pointer"
              />
            </Link>
          </div>

          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            icon={Users}
            subtitle="Active platform members"
          />

          <StatsCard
            title="Monthly Growth"
            value={stats.monthlyGrowth}
            icon={TrendingUp}
            subtitle="New users this month"
            trend={{ value: "Increase", positive: true }}
          />

          <div className="md:col-span-2">
            <StatsCard
              title="Active Listings"
              value={stats.activeListings.toString()}
              icon={FileText}
              subtitle="Published businesses"
              className="h-full"
            />
          </div>

          <div className="md:col-span-2">
            <StatsCard
              title="Total Transactions"
              value={formatAmount(stats.totalTransactions)}
              icon={DollarSign}
              subtitle="All-time volume"
              className="h-full"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="font-semibold mb-4">Pending Actions</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>
                {pendingActions.userReports} user reports to investigate
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{pendingActions.supportTickets} support tickets open</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
