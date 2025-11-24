import { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { getTransactions } from "@/lib/transactionApi";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Offer } from "@/types";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
  in_escrow: { label: "In Escrow", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  failed: { label: "Failed", color: "bg-red-100 text-red-800" },
  negotiation: { label: "Negotiation", color: "bg-purple-100 text-purple-800" },
};

export default function MyOffersPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeOffers: 0,
    savedListings: 0, // Placeholder as we don't have saved listings yet
    totalViewed: 0, // Placeholder
    avgOfferDiscount: "0%", // Placeholder
  });

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      // Filter for offers where current user is buyer
      // Note: Since we don't have the user ID immediately available in the same render cycle sometimes,
      // we might rely on the backend to return only relevant transactions.
      // But getTransactions returns both buyer and seller transactions.
      // We will filter in the render or here if we had the ID.
      // For now, let's assume the backend returns all transactions for the user,
      // and we filter for those where we are the buyer.

      // Ideally we should wait for currentUserId, but for simplicity let's just set data
      // and filter in render or use a separate effect.
      // Actually, let's just use all transactions for now as "Offers" if the user is an investor.
      // A better approach is to check if buyerId matches current user.
      setOffers(data);

      const active = data.filter(
        (o: Offer) => o.status === "pending" || o.status === "in_escrow"
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
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
    fetchOffers();
  }, [fetchOffers]);

  // Filter offers where user is buyer
  const myOffers = currentUserId
    ? offers.filter((offer: Offer) => {
        // Handle both populated object and string ID cases
        const buyerId =
          typeof offer.buyerId === "object" ? offer.buyerId._id : offer.buyerId;
        return buyerId === currentUserId;
      })
    : [];

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
      ) : myOffers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOffers.map((offer) => {
                const statusInfo = statusConfig[
                  offer.status as keyof typeof statusConfig
                ] || {
                  label: offer.status,
                  color: "bg-gray-100 text-gray-800",
                };

                // Helper to safely get nested properties
                const businessTitle =
                  typeof offer.businessId === "object"
                    ? offer.businessId.title
                    : "Unknown Business";
                const sellerName =
                  typeof offer.sellerId === "object" && offer.sellerId.profile
                    ? offer.sellerId.profile.name
                    : "Unknown";
                const askingPrice =
                  typeof offer.businessId === "object"
                    ? offer.businessId.financials?.askingPrice
                    : undefined;

                return (
                  <div
                    key={offer._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {businessTitle}
                        </h3>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Seller:</span>{" "}
                          {sellerName}
                        </div>
                        <div>
                          <span className="font-medium">Asking Price:</span>{" "}
                          {askingPrice ? formatCurrency(askingPrice) : "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span>{" "}
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">
                          Your Offer
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(offer.amount)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/messages")}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Seller
                      </Button>
                    </div>
                  </div>
                );
              })}
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
            onClick: () => navigate("/browse"),
          }}
        />
      )}
    </div>
  );
}
