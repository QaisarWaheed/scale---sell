import { SectionHeader } from "@/components/layouts/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { FileText } from "lucide-react";

export default function ReviewListingsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Review Listings"
        subtitle="Review and approve pending business listings"
      />

      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon={FileText}
            title="No pending listings"
            description="All business listings have been reviewed. New submissions will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
