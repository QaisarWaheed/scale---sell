import { useState, useEffect, useCallback } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTransactions } from "@/lib/transactionApi";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Offer } from "@/types";

const statusConfig = {
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  in_escrow: {
    label: "In Escrow",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function TransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalVolume: 0,
    activeTransactions: 0,
    completed: 0,
    pending: 0,
  });

  const calculateStats = (data: Offer[]) => {
    const newStats = data.reduce(
      (acc, txn) => {
        if (txn.status === "completed") {
          acc.completed++;
          acc.totalVolume += txn.amount;
        } else if (txn.status === "pending") {
          acc.pending++;
        } else if (txn.status === "in_escrow") {
          acc.activeTransactions++;
        }
        return acc;
      },
      { totalVolume: 0, activeTransactions: 0, completed: 0, pending: 0 }
    );
    setStats(newStats);
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
      calculateStats(data);
    } catch (error) {
      toast({
        title: "Error fetching transactions",
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
    fetchTransactions();
  }, [fetchTransactions]);

  const getOtherPartyName = (txn: Offer) => {
    if (!currentUserId) return "User";

    // Check if buyerId is populated object or string ID
    const buyerId =
      typeof txn.buyerId === "object" ? txn.buyerId._id : txn.buyerId;

    if (buyerId === currentUserId) {
      // Current user is buyer, return seller name
      return typeof txn.sellerId === "object" && txn.sellerId.profile
        ? txn.sellerId.profile.name
        : "Seller";
    } else {
      // Current user is seller (or other), return buyer name
      return typeof txn.buyerId === "object" && txn.buyerId.profile
        ? txn.buyerId.profile.name
        : "Buyer";
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Transactions"
        subtitle="View and manage your escrow transactions"
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Volume"
          value={formatCurrency(stats.totalVolume)}
          icon={DollarSign}
        />
        <StatsCard
          title="Active Transactions"
          value={stats.activeTransactions}
          icon={Clock}
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
        />
        <StatsCard title="Pending" value={stats.pending} icon={TrendingUp} />
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              transactions.map((transaction) => {
                const StatusIcon =
                  statusConfig[transaction.status as keyof typeof statusConfig]
                    ?.icon || Clock;
                const statusColor =
                  statusConfig[transaction.status as keyof typeof statusConfig]
                    ?.color || "bg-gray-100 text-gray-800";
                const statusLabel =
                  statusConfig[transaction.status as keyof typeof statusConfig]
                    ?.label || transaction.status;

                return (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {transaction.businessId?.title || "Unknown Business"}
                        </h3>
                        <Badge className={statusColor}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusLabel}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Transaction ID:</span>{" "}
                          {transaction._id.substring(0, 8).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">
                            {(() => {
                              const buyerId =
                                typeof transaction.buyerId === "object"
                                  ? transaction.buyerId._id
                                  : transaction.buyerId;
                              return buyerId === currentUserId
                                ? "Seller"
                                : "Buyer";
                            })()}
                            :
                          </span>{" "}
                          {getOtherPartyName(transaction)}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.updatedAt
                          ? new Date(transaction.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
