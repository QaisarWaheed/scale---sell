import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { FileText, Download, PenTool, Eye } from "lucide-react";
import { contractApi } from "@/lib/contractApi";
import { Contract } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContractViewer } from "@/components/ContractViewer";

export default function SellerContractsPage() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const data = await contractApi.getUserContracts();
      setContracts(data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast({
        title: "Error",
        description: "Failed to load contracts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async (id: string) => {
    try {
      await contractApi.sign(id);
      toast({
        title: "Success",
        description: "Contract signed successfully.",
      });
      fetchContracts();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const getContractStatus = (contract: Contract) => {
    if (contract.signatures.adminApproved) return "active";
    if (contract.signatures.buyer && contract.signatures.seller)
      return "pending_approval";
    return "awaiting_signatures";
  };

  const needsMySignature = (contract: Contract) => {
    return !contract.signatures.seller && !contract.signatures.adminApproved;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Contracts" subtitle="Manage sale agreements" />
        <LoadingSkeleton variant="list" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Contracts"
        subtitle="Manage your sale and investment agreements"
      />

      {contracts.length > 0 ? (
        <div className="grid gap-4">
          {contracts.map((contract) => {
            const status = getContractStatus(contract);
            const needsSignature = needsMySignature(contract);

            return (
              <Card key={contract._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        {contract.contractType === "investment"
                          ? "Investment Agreement"
                          : "Purchase Agreement"}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          status === "active"
                            ? "default"
                            : status === "pending_approval"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {status.replace(/_/g, " ")}
                      </Badge>
                      {needsSignature && (
                        <Badge variant="destructive">Action Required</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Business:</span>
                        <p className="font-medium">
                          {contract.terms.businessName}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-medium">
                          PKR {contract.terms.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Your Payout:
                        </span>
                        <p className="font-medium text-green-600">
                          PKR {contract.terms.sellerPayout.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Created:
                        </span>
                        <p className="font-medium">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedContract(contract)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Contract Details</DialogTitle>
                            <DialogDescription>
                              Review and sign the agreement
                            </DialogDescription>
                          </DialogHeader>
                          {selectedContract && (
                            <ContractViewer
                              contract={selectedContract}
                              currentUserRole="seller"
                              onUpdate={fetchContracts}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={contract.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`contract-${contract._id}.pdf`}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </a>
                      </Button>

                      {needsSignature && (
                        <Button
                          size="sm"
                          onClick={() => handleSignContract(contract._id)}
                        >
                          <PenTool className="mr-2 h-4 w-4" />
                          Sign Contract
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
          <p className="text-muted-foreground">
            Contracts will appear here when buyers make offers on your listings.
          </p>
        </div>
      )}
    </div>
  );
}
