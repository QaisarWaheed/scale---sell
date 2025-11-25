import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "PKR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("currency");
    return (saved as Currency) || "PKR";
  });

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    // Force reload to update non-reactive components if needed, or just rely on context
    // window.location.reload(); // Optional: aggressive but ensures consistency
  };

  const formatAmount = (amount: number) => {
    if (currency === "PKR") {
      return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      // Approximate conversion for display if needed, or just change symbol
      // For now, assuming the amount is stored in a base currency (e.g. PKR)
      // If we want to convert, we need an exchange rate.
      // The user asked for "currency format", which might just mean the symbol.
      // But usually it implies conversion.
      // Given the prompt "currency format should be in rupees by default",
      // let's assume the data is in PKR.
      // If they select USD, we should probably convert it.
      // Let's use a fixed rate for now or just change the symbol if 1:1 isn't intended.
      // Realistically, amounts are in PKR. Converting to USD requires a rate.
      // Let's assume 1 USD = 278 PKR for now.

      const rate = 278;
      const converted = amount / rate;

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(converted);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
