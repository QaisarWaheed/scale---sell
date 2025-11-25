import { useState } from "react";
import { Contract } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { contractApi } from "@/lib/contractApi";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  PenTool,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ContractViewerProps {
  contract: Contract;
  currentUserRole: "buyer" | "seller" | "admin" | "investor";
  onUpdate?: () => void;
}

export function ContractViewer({
  contract,
  currentUserRole,
  onUpdate,
}: ContractViewerProps) {
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    try {
      setLoading(true);
      await contractApi.sign(contract._id);
      toast.success("Contract signed successfully!");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to sign contract");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminApprove = async () => {
    try {
      setLoading(true);
      await contractApi.adminApprove(contract._id);
      toast.success("Contract approved successfully!");
      onUpdate?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to approve contract"
      );
    } finally {
      setLoading(false);
    }
  };

  const isSignedByMe =
    (currentUserRole === "seller" && contract.signatures.seller) ||
    ((currentUserRole === "buyer" || currentUserRole === "investor") &&
      contract.signatures.buyer);

  const canSign =
    !isSignedByMe &&
    currentUserRole !== "admin" &&
    !contract.signatures.adminApproved; // Can't sign if already approved/finalized? Or maybe can? Usually sign before approval.

  // Logic: Both parties sign, then admin approves.
  const allPartiesSigned =
    contract.signatures.buyer && contract.signatures.seller;

  const canAdminApprove =
    currentUserRole === "admin" &&
    allPartiesSigned &&
    !contract.signatures.adminApproved;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {contract.contractType === "investment"
                ? "Investment Agreement"
                : "Purchase Agreement"}
            </CardTitle>
            <CardDescription>Contract ID: {contract._id}</CardDescription>
          </div>
          <Badge
            variant={contract.signatures.adminApproved ? "default" : "outline"}
            className={
              contract.signatures.adminApproved
                ? "bg-green-500 hover:bg-green-600"
                : ""
            }
          >
            {contract.signatures.adminApproved ? "Active" : "Pending Approval"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contract Terms Summary */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Key Terms
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business:</span>
              <span className="font-medium">{contract.terms.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                PKR {contract.terms.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (5%):</span>
              <span className="font-medium">
                PKR {contract.terms.commissionAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seller Payout:</span>
              <span className="font-medium">
                PKR {contract.terms.sellerPayout.toLocaleString()}
              </span>
            </div>
          </div>
          {contract.terms.specificTerms && (
            <>
              <Separator />
              <div>
                <span className="text-muted-foreground block mb-1">
                  Additional Terms:
                </span>
                <p className="text-sm">{contract.terms.specificTerms}</p>
              </div>
            </>
          )}
        </div>

        {/* Signatures Status */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Signatures
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Buyer/Investor Signature */}
            <div
              className={`border rounded-md p-4 flex flex-col items-center justify-center gap-2 text-center ${
                contract.signatures.buyer
                  ? "bg-green-500/5 border-green-200"
                  : "bg-muted/10"
              }`}
            >
              {contract.signatures.buyer ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">
                {contract.contractType === "investment" ? "Investor" : "Buyer"}
              </span>
              <span className="text-xs text-muted-foreground">
                {contract.signatures.buyer
                  ? `Signed on ${format(
                      new Date(contract.signatures.buyerSignedAt!),
                      "MMM d, yyyy"
                    )}`
                  : "Pending Signature"}
              </span>
            </div>

            {/* Seller Signature */}
            <div
              className={`border rounded-md p-4 flex flex-col items-center justify-center gap-2 text-center ${
                contract.signatures.seller
                  ? "bg-green-500/5 border-green-200"
                  : "bg-muted/10"
              }`}
            >
              {contract.signatures.seller ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">Seller</span>
              <span className="text-xs text-muted-foreground">
                {contract.signatures.seller
                  ? `Signed on ${format(
                      new Date(contract.signatures.sellerSignedAt!),
                      "MMM d, yyyy"
                    )}`
                  : "Pending Signature"}
              </span>
            </div>

            {/* Admin Approval */}
            <div
              className={`border rounded-md p-4 flex flex-col items-center justify-center gap-2 text-center ${
                contract.signatures.adminApproved
                  ? "bg-green-500/5 border-green-200"
                  : "bg-muted/10"
              }`}
            >
              {contract.signatures.adminApproved ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">Admin Approval</span>
              <span className="text-xs text-muted-foreground">
                {contract.signatures.adminApproved
                  ? `Approved on ${format(
                      new Date(contract.signatures.adminApprovedAt!),
                      "MMM d, yyyy"
                    )}`
                  : "Pending Approval"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Alerts */}
        {!allPartiesSigned && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Signatures Required</AlertTitle>
            <AlertDescription>
              Both parties must sign this contract before it can be submitted
              for admin approval.
            </AlertDescription>
          </Alert>
        )}

        {allPartiesSigned && !contract.signatures.adminApproved && (
          <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pending Admin Approval</AlertTitle>
            <AlertDescription>
              All parties have signed. Waiting for administrator review and
              approval.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" className="gap-2" asChild>
          <a href={contract.pdfUrl} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </Button>

        <div className="flex gap-2">
          {canSign && (
            <Button onClick={handleSign} disabled={loading} className="gap-2">
              <PenTool className="h-4 w-4" />
              Sign Contract
            </Button>
          )}

          {canAdminApprove && (
            <Button
              onClick={handleAdminApprove}
              disabled={loading}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Contract
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
