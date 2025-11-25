import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getTransaction,
  updateStatus,
  EscrowTransaction as IEscrowTransaction,
} from "@/lib/escrowApi";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getErrorMessage, formatCurrency } from "@/lib/utils";

export default function EscrowTransaction() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<IEscrowTransaction | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setRole(session.user.user_metadata.role || "investor");
        }

        // Use the new getTransaction endpoint
        const fetchedTransaction = await getTransaction(id!);
        setTransaction(fetchedTransaction);
      } catch (error) {
        console.error("Error fetching transaction:", error);
        toast({
          title: "Error",
          description: "Failed to load transaction.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!transaction) return;
    try {
      const updated = await updateStatus(transaction._id, newStatus);
      setTransaction(updated);
      toast({
        title: "Status Updated",
        description: `Transaction status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (loading) return <LoadingSpinner centered />;

  if (!transaction) {
    return (
      <DashboardLayout
        role={role}
        userEmail={user?.email}
        title="Transaction Details"
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Transaction not found</h2>
          <Button variant="link" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "holding":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "released":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout
      role={role}
      userEmail={user?.email}
      title="Escrow Transaction"
    >
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 pl-0"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6">
          {/* Header Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                  Transaction #{transaction._id.slice(-6)}
                </CardTitle>
                <CardDescription>
                  Created on {format(new Date(transaction.createdAt), "PPP")}
                </CardDescription>
              </div>
              <Badge
                className={`${getStatusColor(
                  transaction.status
                )} px-3 py-1 text-sm capitalize`}
              >
                {transaction.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Transaction Amount
                  </p>
                  <p className="text-2xl font-bold flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                {(role === "admin" || role === "seller") && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      {role === "admin" ? "Commission (5%)" : "Platform Fee"}
                    </p>
                    <p className="text-xl font-semibold flex items-center text-orange-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(transaction.commissionAmount || 0)}
                    </p>
                  </div>
                )}
                {(role === "admin" || role === "seller") && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Net Payout
                    </p>
                    <p className="text-xl font-semibold flex items-center text-green-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(transaction.sellerPayout || 0)}
                    </p>
                  </div>
                )}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Business</p>
                  <p className="font-semibold truncate">
                    {transaction.businessId &&
                    typeof transaction.businessId === "object"
                      ? transaction.businessId.title
                      : "Unknown Business"}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Counterparty
                  </p>
                  <p className="font-semibold">
                    {role === "investor"
                      ? transaction.sellerId &&
                        typeof transaction.sellerId === "object"
                        ? transaction.sellerId.profile?.name || "Seller"
                        : "Seller"
                      : transaction.buyerId &&
                        typeof transaction.buyerId === "object"
                      ? transaction.buyerId.profile?.name || "Buyer"
                      : "Buyer"}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="font-semibold capitalize">
                    {transaction.transactionType || "Purchase"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions & Logs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {transaction.logs.map((log, index) => (
                      <div
                        key={index}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-slate-900">
                              {log.action}
                            </div>
                            <time className="font-caveat font-medium text-indigo-500">
                              {format(new Date(log.timestamp), "p")}
                            </time>
                          </div>
                          <div className="text-slate-500 text-xs">
                            {format(new Date(log.timestamp), "PPP")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Escrow.com Payment Button */}
                  {role === "investor" &&
                    transaction.status === "pending" &&
                    transaction.paymentUrl && (
                      <Button
                        className="w-full"
                        onClick={() =>
                          window.open(transaction.paymentUrl, "_blank")
                        }
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Complete Payment on Escrow.com
                      </Button>
                    )}

                  {role === "investor" &&
                    transaction.status === "pending" &&
                    !transaction.paymentUrl && (
                      <div className="p-3 bg-blue-50 text-blue-800 rounded text-sm">
                        Payment processing is being set up. Please check back
                        shortly.
                      </div>
                    )}

                  {/* Escrow.com Transaction Info */}
                  {transaction.escrowComTransactionId && (
                    <div className="p-3 bg-muted rounded-lg space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Escrow.com Transaction ID
                      </p>
                      <p className="font-mono text-sm">
                        {transaction.escrowComTransactionId}
                      </p>
                      {transaction.escrowComStatus && (
                        <>
                          <p className="text-xs text-muted-foreground mt-2">
                            Escrow.com Status
                          </p>
                          <Badge variant="outline" className="capitalize">
                            {transaction.escrowComStatus}
                          </Badge>
                        </>
                      )}
                    </div>
                  )}

                  <Separator className="my-4" />

                  {role === "admin" && (
                    <>
                      <Button
                        className="w-full"
                        onClick={() => handleStatusUpdate("holding")}
                        disabled={transaction.status !== "pending"}
                      >
                        Verify Funds
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleStatusUpdate("released")}
                        disabled={transaction.status !== "holding"}
                      >
                        Release to Seller
                      </Button>
                    </>
                  )}

                  {role === "investor" && transaction.status === "pending" && (
                    <Button className="w-full" disabled>
                      Waiting for Verification
                    </Button>
                  )}

                  {role === "seller" && transaction.status === "holding" && (
                    <div className="p-3 bg-green-50 text-green-800 rounded text-sm">
                      Funds are secured. You may proceed with the transfer.
                    </div>
                  )}

                  {transaction.status === "released" && (
                    <div className="p-3 bg-green-50 text-green-800 rounded text-center font-medium">
                      Transaction Completed
                    </div>
                  )}

                  <Separator className="my-4" />

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={
                      transaction.status === "released" ||
                      transaction.status === "cancelled"
                    }
                  >
                    Cancel Transaction
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
