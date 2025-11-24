import { useState, useEffect, useCallback } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, MapPin, DollarSign, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllListings, deleteListing } from "@/lib/adminApi";
import { formatCurrency } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getErrorMessage } from "@/lib/utils";
import { BusinessListing } from "@/types";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

export default function ReviewListingsPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllListings();
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

  const handleDelete = async () => {
    if (!listingToDelete) return;
    try {
      setActionLoading(true);
      await deleteListing(listingToDelete);
      toast({
        title: "Listing deleted",
        description: "The listing has been removed.",
      });
      setListingToDelete(null);
      fetchListings();
    } catch (error) {
      toast({
        title: "Error deleting listing",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Manage Listings"
        subtitle="View and manage all business listings"
      />

      <Card>
        <CardHeader>
          <CardTitle>All Listings ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <LoadingSkeleton variant="list" count={3} />
            ) : listings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No listings found
              </div>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing._id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">
                          {listing.title}
                        </h3>
                        <Badge
                          variant={
                            listing.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </div>
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
                        variant="destructive"
                        onClick={() => setListingToDelete(listing._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
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

      <ConfirmDialog
        open={!!listingToDelete}
        onOpenChange={(open) => !open && setListingToDelete(null)}
        title="Delete Listing"
        description="Are you sure you want to delete this listing? This action cannot be undone."
        onConfirm={handleDelete}
        variant="destructive"
        confirmText={actionLoading ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
