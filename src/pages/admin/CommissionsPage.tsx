import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { commissionApi } from "@/lib/commissionApi";
import { Commission } from "@/types";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";

export default function CommissionsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    count: 0,
  });
  const [commissions, setCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [totalStats, commissionsData] = await Promise.all([
          commissionApi.getTotal(),
          commissionApi.getAll(1, 50), // Get first 50 for now
        ]);

        setStats(totalStats);
        setCommissions(commissionsData.commissions);
      } catch (error) {
        console.error("Failed to fetch commission data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Commission Tracking"
          subtitle="Monitor platform revenue and fees"
        />
        <LoadingSkeleton variant="grid" count={3} />
        <LoadingSkeleton variant="list" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionHeader
          title="Commission Tracking"
          subtitle="Monitor platform revenue and fees"
        />
        <div className="grid md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Collected"
            value={formatCurrency(stats.totalCollected)}
            icon={DollarSign}
            subtitle="Realized revenue"
            className="border-green-200 bg-green-50/50 dark:bg-green-900/10"
          />
          <StatsCard
            title="Pending Commissions"
            value={formatCurrency(stats.totalPending)}
            icon={Clock}
            subtitle="In escrow"
            className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10"
          />
          <StatsCard
            title="Total Transactions"
            value={stats.count.toString()}
            icon={TrendingUp}
            subtitle="Commissionable events"
          />
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <div className="p-6 border-b">
          <h3 className="font-semibold">Recent Commissions</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Transaction Amount</TableHead>
              <TableHead>Commission (5%)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.length > 0 ? (
              commissions.map((commission) => (
                <TableRow key={commission._id}>
                  <TableCell>
                    {format(new Date(commission.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {commission.transactionType}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(commission.transactionAmount)}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(commission.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        commission.status === "collected"
                          ? "default"
                          : commission.status === "pending"
                          ? "outline"
                          : "destructive"
                      }
                      className={
                        commission.status === "collected"
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {commission.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No commissions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
