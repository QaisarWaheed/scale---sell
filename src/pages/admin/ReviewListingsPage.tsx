import { useState, useEffect, useCallback } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getPendingListings,
  approveListing,
  rejectListing,
} from "@/lib/adminApi";
import { formatCurrency } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getErrorMessage } from "@/lib/utils";
import { BusinessListing } from "@/types";

export default function ReviewListingsPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPendingListings();
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error fetching listings",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await approveListing(id);
      toast({
        title: "Listing approved",
        description: "The listing is now live on the platform.",
      });
      fetchListings();
    } catch (error) {
      toast({
        title: "Error approving listing",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      await rejectListing(id);
      toast({
        title: "Listing rejected",
        description: "The listing has been rejected.",
      });
      fetchListings();
    } catch (error) {
      toast({
        title: "Error rejecting listing",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Review Listings"
        subtitle="Approve or reject pending business listings"
      />

      <Card>
        <CardHeader>
          <CardTitle>Pending Listings ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <LoadingSkeleton variant="list" count={3} />
            ) : listings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No pending listings to review
              </div>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing._id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {listing.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                        <Badge
                          variant="secondary"
                          className="flex items-center"
                        >
                          <Briefcase className="w-3 h-3 mr-1" />
                          {listing.category}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center"
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          {listing.location}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center"
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          {formatCurrency(listing.financials.askingPrice)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(listing._id)}
                        disabled={actionLoading === listing._id}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(listing._id)}
                        disabled={actionLoading === listing._id}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Revenue:
                      </span>{" "}
                      {formatCurrency(listing.financials.revenue)}
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Profit:
                      </span>{" "}
                      {formatCurrency(listing.financials.profit)}
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Seller:
                      </span>{" "}
                      {listing.sellerId?.profile?.name ||
                        listing.sellerId?.email}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
