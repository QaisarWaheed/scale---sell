import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { OfferCard } from "@/components/OfferCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { getIncomingOffers } from "@/lib/offerApi";
import { startConversation } from "@/lib/messageApi";
import { Offer } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";

export default function IncomingOffersPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getIncomingOffers();
      setOffers(data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "Error",
        description: "Failed to load incoming offers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    };
    getUser();
    fetchOffers();
  }, [fetchOffers, navigate]);

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

  if (loading) return <LoadingSpinner centered />;

  return (
    <DashboardLayout
      role="seller"
      userEmail={user?.email}
      title="Incoming Offers"
    >
      <div className="space-y-6">
        <SectionHeader
          title="Incoming Offers"
          subtitle="Manage acquisition offers from investors"
        />

        {offers.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No offers yet"
            description="You haven't received any offers for your listings yet."
          />
        ) : (
          <div className="grid gap-6">
            {offers.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                role="seller"
                onUpdate={fetchOffers}
                onMessage={handleMessage}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
