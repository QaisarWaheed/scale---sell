import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Heart,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

const mockOffers = [
  {
    id: 1,
    business: "SaaS Analytics Platform",
    seller: "Tech Startup Inc",
    offerAmount: "$320,000",
    askingPrice: "$350,000",
    status: "pending",
    submitted: "2025-01-18",
  },
  {
    id: 2,
    business: "E-commerce Store",
    seller: "Online Retail LLC",
    offerAmount: "$110,000",
    askingPrice: "$125,000",
    status: "accepted",
    submitted: "2025-01-15",
  },
];

const mockStats = {
  activeOffers: 2,
  savedListings: 8,
  totalViewed: 45,
  avgOfferDiscount: "12%",
};

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
  countered: { label: "Counter Offer", color: "bg-blue-100 text-blue-800" },
};

export default function MyOffersPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="My Offers"
        subtitle="Track your offers on business opportunities"
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          title="Active Offers"
          value={mockStats.activeOffers}
          icon={DollarSign}
        />
        <StatsCard
          title="Saved Listings"
          value={mockStats.savedListings}
          icon={Heart}
        />
        <StatsCard title="Viewed" value={mockStats.totalViewed} icon={Eye} />
        <StatsCard
          title="Avg Discount"
          value={mockStats.avgOfferDiscount}
          icon={TrendingUp}
        />
      </div>

      {/* Offers */}
      {mockOffers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {offer.business}
                      </h3>
                      <Badge
                        className={
                          statusConfig[
                            offer.status as keyof typeof statusConfig
                          ].color
                        }
                      >
                        {
                          statusConfig[
                            offer.status as keyof typeof statusConfig
                          ].label
                        }
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Seller:</span>{" "}
                        {offer.seller}
                      </div>
                      <div>
                        <span className="font-medium">Asking Price:</span>{" "}
                        {offer.askingPrice}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>{" "}
                        {offer.submitted}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">
                        Your Offer
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {offer.offerAmount}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Seller
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={DollarSign}
          title="No offers yet"
          description="Browse opportunities and make your first offer to get started"
          action={{
            label: "Browse Opportunities",
            onClick: () => console.log("Browse"),
          }}
        />
      )}
    </div>
  );
}
