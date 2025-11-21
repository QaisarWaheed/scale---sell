import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

// Mock data
const mockListings = [
  {
    id: 1,
    title: "SaaS Analytics Platform",
    seller: "Tech Startup Inc",
    price: "$350,000",
    revenue: "$50k MRR",
    status: "pending",
    submitted: "2025-01-20",
  },
  {
    id: 2,
    title: "E-commerce Store",
    seller: "Online Retail LLC",
    price: "$125,000",
    revenue: "$15k MRR",
    status: "pending",
    submitted: "2025-01-19",
  },
  {
    id: 3,
    title: "Mobile App",
    seller: "AppDev Studio",
    price: "$75,000",
    revenue: "$8k MRR",
    status: "approved",
    submitted: "2025-01-15",
  },
];

const mockStats = {
  pendingReview: 8,
  approved: 45,
  rejected: 3,
  totalListings: 56,
};

const statusConfig = {
  pending: {
    label: "Pending Review",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

export default function ReviewListingsPage() {
  const [listings, setListings] = useState(mockListings);

  const handleApprove = (id: number) => {
    setListings(
      listings.map((listing) =>
        listing.id === id ? { ...listing, status: "approved" } : listing
      )
    );
  };

  const handleReject = (id: number) => {
    setListings(
      listings.map((listing) =>
        listing.id === id ? { ...listing, status: "rejected" } : listing
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Review Listings"
        subtitle="Approve or reject business listings"
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Pending Review"
          value={mockStats.pendingReview}
          icon={Clock}
        />
        <StatsCard
          title="Approved"
          value={mockStats.approved}
          icon={CheckCircle}
        />
        <StatsCard title="Rejected" value={mockStats.rejected} icon={XCircle} />
        <StatsCard
          title="Total Listings"
          value={mockStats.totalListings}
          icon={FileText}
        />
      </div>

      {/* Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Listings Pending Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {listings.map((listing) => {
              const StatusIcon =
                statusConfig[listing.status as keyof typeof statusConfig].icon;
              return (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <Badge
                        className={
                          statusConfig[
                            listing.status as keyof typeof statusConfig
                          ].color
                        }
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {
                          statusConfig[
                            listing.status as keyof typeof statusConfig
                          ].label
                        }
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Seller:</span>{" "}
                        {listing.seller}
                      </div>
                      <div>
                        <span className="font-medium">Revenue:</span>{" "}
                        {listing.revenue}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>{" "}
                        {listing.submitted}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right mr-4">
                      <div className="text-xl font-bold text-primary">
                        {listing.price}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {listing.status === "pending" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(listing.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(listing.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
