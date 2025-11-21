import { SectionHeader } from "@/components/layouts/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { TrendingUp } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Analytics"
        subtitle="Platform performance and insights"
      />

      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon={TrendingUp}
            title="Analytics Dashboard"
            description="Detailed analytics and reporting features coming soon. Track platform growth, user engagement, and transaction metrics."
          />
        </CardContent>
      </Card>
    </div>
  );
}
