import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Define an interface for the expected error structure with a 'response' property
interface ErrorWithResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    // Cast to the defined interface to access 'response' safely without 'any'
    const typedError = error as ErrorWithResponse;
    return typedError.response?.data?.message || "An unexpected error occurred";
  }
  if (error instanceof Error) return error.message;
  return String(error);
};
