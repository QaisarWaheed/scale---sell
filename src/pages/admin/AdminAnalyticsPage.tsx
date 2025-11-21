import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
} from "lucide-react";

const mockStats = {
  totalUsers: 247,
  totalListings: 56,
  totalTransactions: "$2.5M",
  avgTransactionValue: "$85k",
  monthlyGrowth: "+23%",
  activeConversations: 142,
};

export default function AdminAnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Platform Analytics"
        subtitle="Overview of platform performance and metrics"
      />

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={mockStats.totalUsers}
          icon={Users}
          trend={{ value: mockStats.monthlyGrowth, positive: true }}
        />
        <StatsCard
          title="Total Listings"
          value={mockStats.totalListings}
          icon={FileText}
          trend={{ value: "+15% from last month", positive: true }}
        />
        <StatsCard
          title="Transaction Volume"
          value={mockStats.totalTransactions}
          icon={DollarSign}
          trend={{ value: "+28% from last month", positive: true }}
        />
        <StatsCard
          title="Avg Transaction"
          value={mockStats.avgTransactionValue}
          icon={TrendingUp}
        />
        <StatsCard
          title="Monthly Growth"
          value={mockStats.monthlyGrowth}
          icon={BarChart3}
        />
        <StatsCard
          title="Active Conversations"
          value={mockStats.activeConversations}
          icon={MessageSquare}
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                Chart: User growth over time
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                Chart: Monthly transaction volume
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listing Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                Chart: Distribution by category
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Chart: Daily active users</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
