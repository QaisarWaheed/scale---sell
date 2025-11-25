import { useState } from "react";
import { Investment } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Calendar, DollarSign, Percent, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { investmentApi } from "@/lib/investmentApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

interface InvestmentCardProps {
  investment: Investment;
  role: "investor" | "seller" | "admin";
  onUpdate?: () => void;
}

export function InvestmentCard({
  investment,
  role,
  onUpdate,
}: InvestmentCardProps) {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "rejected":
      case "withdrawn":
      case "cancelled":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await investmentApi.approve(investment._id);
      toast.success("Investment approved! Escrow transaction created.");
      onUpdate?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to approve investment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await investmentApi.reject(investment._id, rejectReason);
      toast.success("Investment rejected.");
      onUpdate?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to reject investment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      await investmentApi.withdraw(investment._id);
      toast.success("Investment withdrawn.");
      onUpdate?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to withdraw investment"
      );
    } finally {
      setLoading(false);
    }
  };

  const businessTitle =
    typeof investment.businessId === "object"
      ? investment.businessId.title
      : "Unknown Business";

  const otherPartyName =
    role === "investor"
      ? typeof investment.sellerId === "object"
        ? investment.sellerId.profile?.name || investment.sellerId.email
        : "Seller"
      : typeof investment.investorId === "object"
      ? investment.investorId.profile?.name || investment.investorId.email
      : "Investor";

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{businessTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {role === "investor" ? "Seller" : "Investor"}: {otherPartyName}
            </p>
          </div>
          <Badge className={getStatusColor(investment.status)}>
            {investment.status.charAt(0).toUpperCase() +
              investment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Amount
            </p>
            <p className="font-medium">
              {formatCurrency(investment.investmentAmount)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Percent className="h-3 w-3" /> Type
            </p>
            <p className="font-medium capitalize">
              {investment.investmentType.replace("_", " ")}
              {investment.investmentType === "equity"
                ? ` (${investment.equityPercentage}%)`
                : ` (${investment.revenueSharePercentage}%)`}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Duration
            </p>
            <p className="font-medium">
              {investment.terms.duration
                ? `${investment.terms.duration} Months`
                : "Indefinite"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Date
            </p>
            <p className="font-medium">
              {format(new Date(investment.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {investment.terms.conditions && (
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Conditions:</p>
            <p className="text-muted-foreground line-clamp-2">
              {investment.terms.conditions}
            </p>
          </div>
        )}

        {investment.sellerResponse && (
          <div className="bg-red-500/10 p-3 rounded-md text-sm text-red-600 dark:text-red-400">
            <p className="font-medium mb-1">Seller Response:</p>
            <p>{investment.sellerResponse}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-0">
        {investment.status === "pending" && role === "seller" && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Investment Offer</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this offer.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..."
                />
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={loading || !rejectReason}
                  >
                    Confirm Rejection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="default"
              size="sm"
              onClick={handleApprove}
              disabled={loading}
            >
              Approve
            </Button>
          </>
        )}

        {investment.status === "pending" && role === "investor" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleWithdraw}
            disabled={loading}
          >
            Withdraw
          </Button>
        )}

        {investment.escrowTransactionId && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              navigate(`/dashboard/escrow/${investment.escrowTransactionId}`)
            }
          >
            <FileText className="h-4 w-4" />
            View Transaction
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
