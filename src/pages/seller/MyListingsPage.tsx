import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
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
import { useToast } from "@/hooks/use-toast";
import { getMyListings, deleteListing } from "@/lib/listingApi";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

export default function MyListingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await getMyListings();
      setListings(data);
      calculateStats(data);
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

  const calculateStats = (data: any[]) => {
    const newStats = data.reduce(
      (acc, listing) => {
        acc.totalListings++;
        if (listing.status === "approved") acc.activeListings++;
        // Mocking views and inquiries for now as they might not be in the model yet
        // If they are in the model, use listing.views, listing.inquiries
        acc.totalViews += listing.views || 0;
        acc.totalInquiries += listing.inquiries || 0;
        return acc;
      },
      { totalListings: 0, activeListings: 0, totalViews: 0, totalInquiries: 0 }
    );
    setStats(newStats);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteListing(deleteId);
      toast({
        title: "Listing deleted",
        description: "Your listing has been removed successfully",
      });
      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error deleting listing",
        description:
          error.response?.data?.message || "Failed to delete listing",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="My Listings"
        subtitle="Manage your business listings"
        action={
          <Button onClick={() => navigate("/sell-business")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Listings"
          value={stats.totalListings}
          icon={Building2}
        />
        <StatsCard
          title="Active"
          value={stats.activeListings}
          icon={TrendingUp}
        />
        <StatsCard title="Total Views" value={stats.totalViews} icon={Eye} />
        <StatsCard
          title="Inquiries"
          value={stats.totalInquiries}
          icon={DollarSign}
        />
      </div>

      {/* Listings */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading listings...
        </div>
      ) : listings.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {listings.map((listing) => (
            <Card
              key={listing._id}
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
                        listing.status === "approved" ? "default" : "secondary"
                      }
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(listing.financials.askingPrice)}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium">
                      {formatCurrency(listing.financials.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-medium">{listing.views || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Inquiries:</span>
                    <span className="font-medium">
                      {listing.inquiries || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/listings/${listing._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/sell-business?edit=${listing._id}`)
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(listing._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No listings yet"
          description="Create your first business listing to start attracting potential buyers"
          action={{
            label: "Create Your First Listing",
            onClick: () => navigate("/sell-business"),
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Listing"
        description="Are you sure you want to delete this listing? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
