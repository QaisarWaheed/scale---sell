import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { InvestmentCard } from "@/components/InvestmentCard";
import { investmentApi } from "@/lib/investmentApi";
import { Investment } from "@/types";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Briefcase } from "lucide-react";

export default function SellerInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = async () => {
    try {
      const data = await investmentApi.getSellerInvestments();
      setInvestments(data);
    } catch (error) {
      console.error("Failed to fetch investments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Received Investment Offers"
          subtitle="Manage investment proposals for your businesses"
        />
        <LoadingSkeleton variant="grid" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Received Investment Offers"
        subtitle="Manage investment proposals for your businesses"
      />

      {investments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((investment) => (
            <InvestmentCard
              key={investment._id}
              investment={investment}
              role="seller"
              onUpdate={fetchInvestments}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No investment offers yet
          </h3>
          <p className="text-muted-foreground">
            When investors make offers on your listings, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
