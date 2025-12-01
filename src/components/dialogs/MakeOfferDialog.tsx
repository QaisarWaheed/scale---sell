import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { createOffer } from "@/lib/offerApi";
import { PaymentMethod } from "@/types";
import { getErrorMessage } from "@/lib/utils";

interface MakeOfferDialogProps {
  businessId: string;
  askingPrice: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function MakeOfferDialog({
  businessId,
  askingPrice,
  trigger,
  onSuccess,
}: MakeOfferDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    offerAmount: askingPrice.toString(),
    paymentMethod: "" as PaymentMethod | "",
    message: "",
    phoneNumber: "",
    accountNumber: "",
    bankName: "",
    accountTitle: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value as PaymentMethod }));
  };

  const handleSubmit = async () => {
    if (!formData.paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const paymentDetails: any = {};
      if (
        formData.paymentMethod === "jazzcash" ||
        formData.paymentMethod === "easypaisa"
      ) {
        if (!formData.phoneNumber) {
          throw new Error("Phone number is required for mobile wallets");
        }
        paymentDetails.phoneNumber = formData.phoneNumber;
      } else if (formData.paymentMethod === "bank_transfer") {
        if (!formData.accountNumber || !formData.bankName) {
          throw new Error("Bank details are required");
        }
        paymentDetails.accountNumber = formData.accountNumber;
        paymentDetails.bankName = formData.bankName;
        paymentDetails.accountTitle = formData.accountTitle;
      }

      await createOffer({
        businessId,
        offerAmount: Number(formData.offerAmount),
        paymentMethod: formData.paymentMethod,
        paymentDetails,
        message: formData.message,
      });

      toast({
        title: "Offer Sent!",
        description: "Your offer has been sent to the seller for approval.",
      });

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentFields = () => {
    switch (formData.paymentMethod) {
      case "escrow":
        return (
          <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🛡️</div>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-green-800 dark:text-green-200">Escrow Protection Enabled</p>
                <ul className="space-y-1 text-green-700 dark:text-green-300">
                  <li>✓ Funds held securely by platform</li>
                  <li>✓ Released only after contract signed</li>
                  <li>✓ 5% platform fee (deducted from escrow)</li>
                  <li>✓ Payment link provided after approval</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "jazzcash":
      case "easypaisa":
        return (
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Mobile Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="03XX-XXXXXXX"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
        );
      case "bank_transfer":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                name="bankName"
                placeholder="e.g. HBL, Meezan Bank"
                value={formData.bankName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account / IBAN Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountTitle">Account Title (Optional)</Label>
              <Input
                id="accountTitle"
                name="accountTitle"
                placeholder="Account Holder Name"
                value={formData.accountTitle}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Make Offer</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Submit your offer to the seller. They will review and approve it to
            start the transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="offerAmount">Offer Amount (PKR)</Label>
            <Input
              id="offerAmount"
              name="offerAmount"
              type="number"
              value={formData.offerAmount}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="escrow">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🛡️</span>
                    <div>
                      <div className="font-semibold">Platform Escrow (Recommended)</div>
                      <div className="text-xs text-muted-foreground">Secure payment - Funds held until contract signed</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
                <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderPaymentFields()}

          <div className="space-y-2">
            <Label htmlFor="message">Message to Seller (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Hi, I'm interested in your business..."
              value={formData.message}
              onChange={handleChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.paymentMethod}
          >
            {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
            Send Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
