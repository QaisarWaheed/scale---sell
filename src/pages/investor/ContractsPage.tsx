import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { FileText, Download, PenTool } from "lucide-react";
import { contractApi } from "@/lib/contractApi";
import { Contract } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

export default function ContractsPage() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (contract.signatures.buyer && contract.signatures.seller) return "pending_approval";
    return "draft";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Contracts"
          subtitle="Manage your legal documents"
        />
        <LoadingSkeleton variant="list" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Contracts"
        subtitle="Manage your legal documents"
      />

      {contracts.length > 0 ? (
        <div className="grid gap-4">
          {contracts.map((contract) => {
            const status = getContractStatus(contract);
            return (
              <Card key={contract._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        Contract #{contract._id.slice(-6)}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={
                        status === "active"
                          ? "default"
                          : status === "pending_approval"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Type: {contract.contractType}</p>
                      <p>Created: {new Date(contract.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 md:flex-none"
                        asChild
                      >
                        <a 
                          href={contract.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                      {status === "draft" && (
                        <Button 
                          size="sm" 
                          className="flex-1 md:flex-none"
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
            Contracts will appear here once generated for your transactions.
          </p>
        </div>
      )}
    </div>
  );
}
