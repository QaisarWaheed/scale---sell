import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Heart } from "lucide-react";
import { getSavedListings } from "@/lib/userApi";
import { BusinessListing } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

export default function SavedListingsPage() {
  const { formatAmount } = useCurrency();
  const [savedListings, setSavedListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedListings = async () => {
      try {
        const data = await getSavedListings();
        setSavedListings(data);
      } catch (error) {
        console.error("Failed to fetch saved listings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedListings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Saved Listings"
          subtitle="Your bookmarked opportunities"
        />
        <LoadingSkeleton variant="list" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Saved Listings"
        subtitle="Your bookmarked opportunities"
      />

      {savedListings.length > 0 ? (
        <div className="grid gap-4">
          {savedListings.map((listing) => (
            <div
              key={listing._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{listing.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {listing.category} •{" "}
                  {formatAmount(listing.financials.revenue)} Revenue
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary mb-1">
                  {formatAmount(listing.financials.askingPrice)}
                </div>
                <Button size="sm" asChild>
                  <Link to={`/listing/${listing._id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No saved listings</h3>
          <p className="text-muted-foreground mb-4">
            Start browsing to find opportunities you like.
          </p>
          <Button asChild>
            <Link to="/browse">Browse Listings</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
