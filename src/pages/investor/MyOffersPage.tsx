import { useState, useEffect, useCallback } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { OfferCard } from "@/components/OfferCard";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { getMyOffers } from "@/lib/offerApi";
import { startConversation } from "@/lib/messageApi";
import { Offer } from "@/types";
import { getErrorMessage } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { DollarSign, Eye, Heart, TrendingUp } from "lucide-react";

export default function MyOffersPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOffers: 0,
    savedListings: 0,
    totalViewed: 0,
    avgOfferDiscount: "0%",
  });

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyOffers();
      setOffers(data);

      const active = data.filter(
        (o) => o.status === "pending" || o.status === "approved"
      ).length;
      setStats((prev) => ({ ...prev, activeOffers: active }));
    } catch (error) {
      toast({
        title: "Error fetching offers",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleMessage = async (userId: string, businessId: string) => {
    try {
      const thread = await startConversation(businessId, userId);
      navigate("/dashboard?tab=messages");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation.",
        variant: "destructive",
      });
    }
  };

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
          value={stats.activeOffers}
          icon={DollarSign}
        />
        <StatsCard
          title="Saved Listings"
          value={stats.savedListings}
          icon={Heart}
        />
        <StatsCard title="Viewed" value={stats.totalViewed} icon={Eye} />
        <StatsCard
          title="Avg Discount"
          value={stats.avgOfferDiscount}
          icon={TrendingUp}
        />
      </div>

      {/* Offers */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading offers...
        </div>
      ) : offers.length > 0 ? (
        <div className="grid gap-6">
          {offers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              role="investor"
              onUpdate={fetchOffers}
              onMessage={handleMessage}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={DollarSign}
          title="No offers yet"
          description="Browse opportunities and make your first offer to get started"
          action={{
            label: "Browse Opportunities",
            onClick: () => navigate("/browse"),
          }}
        />
      )}
    </div>
  );
}
