import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const mockListings = [
  {
    id: 1,
    title: "SaaS Analytics Platform",
    price: "$350,000",
    revenue: "$50k MRR",
    views: 245,
    inquiries: 12,
    status: "active",
    created: "2025-01-10",
  },
  {
    id: 2,
    title: "E-commerce Store",
    price: "$125,000",
    revenue: "$15k MRR",
    views: 189,
    inquiries: 8,
    status: "active",
    created: "2025-01-15",
  },
];

const mockStats = {
  totalListings: 2,
  activeListings: 2,
  totalViews: 434,
  totalInquiries: 20,
};

export default function MyListingsPage() {
  return (
    <div>
      <PageHeader
        title="My Listings"
        subtitle="Manage your business listings"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Listings"
          value={mockStats.totalListings}
          icon={Building2}
        />
        <StatsCard
          title="Active"
          value={mockStats.activeListings}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Views"
          value={mockStats.totalViews}
          icon={Eye}
        />
        <StatsCard
          title="Inquiries"
          value={mockStats.totalInquiries}
          icon={DollarSign}
        />
      </div>

      {/* Listings */}
      {mockListings.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {mockListings.map((listing) => (
            <Card
              key={listing.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {listing.title}
                    </h3>
                    <Badge
                      variant={
                        listing.status === "active" ? "default" : "secondary"
                      }
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {listing.price}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium">{listing.revenue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-medium">{listing.views}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Inquiries:</span>
                    <span className="font-medium">{listing.inquiries}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{listing.created}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Building2}
              title="No listings yet"
              description="Create your first business listing to start attracting potential buyers"
              action={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
