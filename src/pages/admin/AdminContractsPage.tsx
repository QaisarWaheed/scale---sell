import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contractApi } from "@/lib/contractApi";
import { getErrorMessage } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContractViewer } from "@/components/ContractViewer";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PopulatedContract {
  _id: string;
  transactionId: {
    _id: string;
    amount: number;
    buyerId: {
      _id: string;
      email: string;
      profile: { name?: string };
    };
    sellerId: {
      _id: string;
      email: string;
      profile: { name?: string };
    };
    businessId: {
      _id: string;
      title: string;
    };
  };
  contractType: "purchase" | "investment";
  pdfUrl: string;
  signatures: {
    buyer: boolean;
    buyerSignedAt?: string;
    seller: boolean;
    sellerSignedAt?: string;
    adminApproved: boolean;
    adminApprovedAt?: string;
  };
  createdAt: string;
}

export default function AdminContractsPage() {
  const { toast } = useToast();
  const { formatAmount } = useCurrency();
  const [contracts, setContracts] = useState<PopulatedContract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<PopulatedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<PopulatedContract | null>(
    null
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractApi.getAllContracts();
      setContracts(data as any);
      setFilteredContracts(data as any);
    } catch (error) {
      toast({
        title: "Error fetching contracts",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    let filtered = contracts;

    switch (filter) {
      case "pending":
        filtered = contracts.filter(
          (c) =>
            !c.signatures.adminApproved &&
            c.signatures.buyer &&
            c.signatures.seller
        );
        break;
      case "awaiting_signatures":
        filtered = contracts.filter(
          (c) => !c.signatures.buyer || !c.signatures.seller
        );
        break;
      case "approved":
        filtered = contracts.filter((c) => c.signatures.adminApproved);
        break;
      default:
        filtered = contracts;
    }

    setFilteredContracts(filtered);
  }, [filter, contracts]);

  const handleViewContract = (contract: PopulatedContract) => {
    setSelectedContract(contract);
    setViewDialogOpen(true);
  };

  const handleApprove = async (contractId: string) => {
    try {
      await contractApi.adminApprove(contractId);
      toast({
        title: "Contract approved",
        description: "The contract has been approved and escrow status updated.",
      });
      fetchContracts();
      setViewDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error approving contract",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (contract: PopulatedContract) => {
    if (contract.signatures.adminApproved) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    }
    if (contract.signatures.buyer && contract.signatures.seller) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Clock className="mr-1 h-3 w-3" />
          Pending Approval
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        Awaiting Signatures
      </Badge>
    );
  };

  const getPendingCount = () => {
    return contracts.filter(
      (c) =>
        !c.signatures.adminApproved && c.signatures.buyer && c.signatures.seller
    ).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Contract Management"
          subtitle="Review and approve contracts"
        />
        <div className="text-center py-12 text-muted-foreground">
          Loading contracts...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Contract Management"
        subtitle="Review and approve contracts between buyers and sellers"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold">{contracts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getPendingCount()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    contracts.filter((c) => c.signatures.adminApproved).length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Awaiting Signatures
                </p>
                <p className="text-2xl font-bold">
                  {
                    contracts.filter(
                      (c) => !c.signatures.buyer || !c.signatures.seller
                    ).length
                  }
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter contracts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contracts</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="awaiting_signatures">
              Awaiting Signatures
            </SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          Showing {filteredContracts.length} of {contracts.length} contracts
        </span>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No contracts found</p>
            </CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => (
            <Card key={contract._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {contract.transactionId.businessId.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Contract ID: {contract._id.slice(-8)}
                        </p>
                      </div>
                      {getStatusBadge(contract)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold">
                          {formatAmount(contract.transactionId.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Buyer</p>
                        <p className="font-semibold">
                          {contract.transactionId.buyerId.profile.name ||
                            contract.transactionId.buyerId.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Seller</p>
                        <p className="font-semibold">
                          {contract.transactionId.sellerId.profile.name ||
                            contract.transactionId.sellerId.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-semibold">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            contract.signatures.buyer
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-muted-foreground">
                          Buyer {contract.signatures.buyer ? "Signed" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            contract.signatures.seller
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-muted-foreground">
                          Seller {contract.signatures.seller ? "Signed" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            contract.signatures.adminApproved
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-muted-foreground">
                          Admin{" "}
                          {contract.signatures.adminApproved
                            ? "Approved"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewContract(contract)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={contract.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`contract-${contract._id}.pdf`}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </a>
                    </Button>
                    {contract.signatures.buyer &&
                      contract.signatures.seller &&
                      !contract.signatures.adminApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(contract._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Contract Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <ContractViewer
              contract={selectedContract as any}
              currentUserRole="admin"
              onUpdate={() => {
                fetchContracts();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
