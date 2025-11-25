import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Offer, BusinessListing, User } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { PaymentMethodBadge } from "./PaymentMethodBadge";
import { MessageSquare, Check, X, Ban } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { approveOffer, rejectOffer, withdrawOffer } from "@/lib/offerApi";
import { LoadingSpinner } from "./ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";

interface OfferCardProps {
  offer: Offer;
  role: "investor" | "seller";
  onUpdate: () => void;
  onMessage: (userId: string, businessId: string) => void;
}

export function OfferCard({
  offer,
  role,
  onUpdate,
  onMessage,
}: OfferCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const business = offer.businessId as BusinessListing;
  const otherParty =
    role === "investor" ? (offer.sellerId as User) : (offer.buyerId as User);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await approveOffer(offer._id);
      toast({
        title: "Offer Approved",
        description: "Escrow transaction has been created.",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve offer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectOffer(offer._id, rejectReason);
      toast({
        title: "Offer Rejected",
        description: "The offer has been rejected.",
      });
      setIsRejectDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject offer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      await withdrawOffer(offer._id);
      toast({
        title: "Offer Withdrawn",
        description: "Your offer has been withdrawn.",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to withdraw offer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">
              {business?.title || "Unknown Business"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {role === "investor" ? "Seller: " : "Buyer: "}
              {otherParty?.profile?.name || otherParty?.email || "Unknown"}
            </p>
          </div>
          <Badge variant="outline" className={statusColors[offer.status]}>
            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Offer Amount</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(offer.offerAmount)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block mb-1">
              Payment Method
            </span>
            <PaymentMethodBadge method={offer.paymentMethod} />
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Submitted</span>
            <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {offer.message && (
          <div className="text-sm bg-muted p-3 rounded-md">
            <span className="font-semibold block mb-1">Message:</span>
            {offer.message}
          </div>
        )}

        {offer.sellerResponse && (
          <div className="text-sm bg-red-50 text-red-900 p-3 rounded-md border border-red-100">
            <span className="font-semibold block mb-1">Seller Response:</span>
            {offer.sellerResponse}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMessage(otherParty._id, business._id)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>

        {role === "seller" && offer.status === "pending" && (
          <>
            <Dialog
              open={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={loading}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Offer</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this offer.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsRejectDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectReason || loading}
                  >
                    {loading ? (
                      <LoadingSpinner className="h-4 w-4" />
                    ) : (
                      "Reject Offer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
          </>
        )}

        {role === "investor" && offer.status === "pending" && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <Ban className="h-4 w-4 mr-2" />
            )}
            Withdraw
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
