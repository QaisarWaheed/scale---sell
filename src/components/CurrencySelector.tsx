import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DollarSign, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencySelectorProps {
  className?: string;
  compact?: boolean;
}

export function CurrencySelector({
  className,
  compact,
}: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "default"}
          className={cn(
            "w-full justify-start",
            compact && "justify-center px-2",
            className
          )}
          title="Select Currency"
        >
          {currency === "PKR" ? (
            <Coins className="h-5 w-5 flex-shrink-0" />
          ) : (
            <DollarSign className="h-5 w-5 flex-shrink-0" />
          )}
          {!compact && <span className="ml-2 font-medium">{currency}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => setCurrency("PKR")}>
          <Coins className="mr-2 h-4 w-4" />
          <span>PKR (Rupees)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("USD")}>
          <DollarSign className="mr-2 h-4 w-4" />
          <span>USD (Dollars)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
