import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getPendingListings,
  approveListing,
  rejectListing,
  deleteListing,
} from "@/lib/adminApi";
import { ListingApprovalCard } from "@/components/admin/ListingApprovalCard";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { useNavigate } from "react-router-dom";

export default function ReviewListingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await getPendingListings();
      setListings(data);
    } catch (error: any) {
      toast({
        title: "Error fetching listings",
        description: error.response?.data?.message || "Failed to load listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await approveListing(id);
      toast({
        title: "Listing approved",
        description: "The listing is now live on the marketplace.",
      });
      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error approving listing",
        description:
          error.response?.data?.message || "Failed to approve listing",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(true);
      await rejectListing(id);
      toast({
        title: "Listing rejected",
        description: "The listing has been rejected.",
      });
      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error rejecting listing",
        description:
          error.response?.data?.message || "Failed to reject listing",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;
    try {
      setActionLoading(true);
      await deleteListing(listingToDelete);
      toast({
        title: "Listing deleted",
        description: "The listing has been permanently removed.",
      });
      setListingToDelete(null);
      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error deleting listing",
        description:
          error.response?.data?.message || "Failed to delete listing",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Review Listings"
        subtitle="Review and approve pending business listings"
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading listings...
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No pending listings"
          description="All business listings have been reviewed. New submissions will appear here."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingApprovalCard
              key={listing._id}
              listing={listing}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={(id) => setListingToDelete(id)}
              onView={(id) => navigate(`/listings/${id}`)}
            />
          ))}
        </div>
      )}

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
