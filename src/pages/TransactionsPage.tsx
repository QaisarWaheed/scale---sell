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

// Mock data
const mockStats = {
  totalVolume: "$2,450,000",
  activeTransactions: 3,
  completed: 12,
  pending: 2,
};

const mockTransactions = [
  {
    id: "TXN-001",
    business: "SaaS Analytics Platform",
    amount: "$350,000",
    status: "completed",
    date: "2025-01-15",
    buyer: "John Investor",
    seller: "Tech Startup Inc",
  },
  {
    id: "TXN-002",
    business: "E-commerce Store",
    amount: "$125,000",
    status: "in_escrow",
    date: "2025-01-18",
    buyer: "Sarah Capital",
    seller: "Online Retail LLC",
  },
  {
    id: "TXN-003",
    business: "Mobile App Development",
    amount: "$75,000",
    status: "pending",
    date: "2025-01-20",
    buyer: "Mike Ventures",
    seller: "AppDev Studio",
  },
];

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
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function TransactionsPage() {
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
          value={mockStats.totalVolume}
          icon={DollarSign}
          trend={{ value: "12% from last month", positive: true }}
        />
        <StatsCard
          title="Active Transactions"
          value={mockStats.activeTransactions}
          icon={Clock}
        />
        <StatsCard
          title="Completed"
          value={mockStats.completed}
          icon={CheckCircle}
        />
        <StatsCard
          title="Pending"
          value={mockStats.pending}
          icon={TrendingUp}
        />
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((transaction) => {
              const StatusIcon =
                statusConfig[transaction.status as keyof typeof statusConfig]
                  .icon;
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{transaction.business}</h3>
                      <Badge
                        className={
                          statusConfig[
                            transaction.status as keyof typeof statusConfig
                          ].color
                        }
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {
                          statusConfig[
                            transaction.status as keyof typeof statusConfig
                          ].label
                        }
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Transaction ID:</span>{" "}
                        {transaction.id}
                      </div>
                      <div>
                        <span className="font-medium">Buyer:</span>{" "}
                        {transaction.buyer}
                      </div>
                      <div>
                        <span className="font-medium">Seller:</span>{" "}
                        {transaction.seller}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {transaction.amount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.date}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
