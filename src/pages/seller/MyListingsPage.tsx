import { useState, useEffect, useCallback } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { getMyListings, deleteListing } from "@/lib/listingApi";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { BusinessListing } from "@/types";

const statusColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  sold: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
};

export default function MyListingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
  });

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyListings();
      setListings(data);

      // Calculate stats
      setStats({
        totalListings: data.length,
        activeListings: data.filter(
          (l: BusinessListing) => l.status === "active"
        ).length,
        totalViews: 0, // Placeholder
        totalInquiries: 0, // Placeholder
      });
    } catch (error) {
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
        description: "Your listing has been removed.",
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
        title="My Listings"
        subtitle="Manage your business listings and track performance"
        action={
          <Button onClick={() => navigate("/sell-business")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listings
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Listings"
          value={stats.totalListings}
          icon={TrendingUp}
        />
        <StatsCard
          title="Active Listings"
          value={stats.activeListings}
          icon={DollarSign}
        />
        <StatsCard title="Total Views" value={stats.totalViews} icon={Eye} />
        <StatsCard
          title="Inquiries"
          value={stats.totalInquiries}
          icon={MessageSquare}
        />
      </div>

      {/* Listings List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading listings...
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No listings yet"
          description="Create your first business listing to start selling."
          action={{
            label: "Create Listing",
            onClick: () => navigate("/sell-business"),
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <Badge
                        className={
                          statusColors[
                            listing.status as keyof typeof statusColors
                          ] || "bg-gray-100"
                        }
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Price:</span>{" "}
                        {formatCurrency(listing.financials.askingPrice)}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Views:</span> 0
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/listings/${listing._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/sell-business?edit=${listing._id}`)
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Listing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setListingToDelete(listing._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
