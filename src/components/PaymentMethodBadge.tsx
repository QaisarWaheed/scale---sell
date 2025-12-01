import { Badge } from "@/components/ui/badge";
import { PaymentMethod } from "@/types";
import { CreditCard, Smartphone, Building2, Wallet, Shield } from "lucide-react";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  const config = {
    escrow: {
      label: "Platform Escrow",
      icon: Shield,
      color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200",
    },
    jazzcash: {
      label: "JazzCash",
      icon: Smartphone,
      color: "bg-red-100 text-red-800 border-red-200",
    },
    easypaisa: {
      label: "EasyPaisa",
      icon: Smartphone,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    bank_transfer: {
      label: "Bank Transfer",
      icon: Building2,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    other: {
      label: "Other",
      icon: Wallet,
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

  const { label, icon: Icon, color } = config[method] || config.other;

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
