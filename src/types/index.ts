import { BusinessListing } from "./listing";
import { UpdateProfileData } from "./profile";

export * from "./listing";
export * from "./profile";

export interface UserProfile {
  name?: string;
  phone?: string;
  location?: string;
  company?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface User {
  _id: string; // MongoDB ID
  supabaseId: string;
  email: string;
  role: "investor" | "seller" | "admin";
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod =
  | "jazzcash"
  | "easypaisa"
  | "bank_transfer"
  | "escrow"
  | "other";

export interface PaymentDetails {
  phoneNumber?: string;
  accountNumber?: string;
  bankName?: string;
  accountTitle?: string;
}

export interface Offer {
  _id: string;
  businessId: BusinessListing | string;
  buyerId: User | string;
  sellerId: User | string;
  offerAmount: number;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  message?: string;
  sellerResponse?: string;
  escrowTransactionId?: string | EscrowTransaction;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  totalVolume: number;
  monthlyGrowth?: string;
  totalTransactions?: string | number;
}

export interface Message {
  _id: string;
  threadId: string;
  senderId: User | string;
  receiverId: User | string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Thread {
  _id: string;
  businessId: BusinessListing; // Usually populated
  participants: (User | string)[]; // Array of users or IDs
  lastMessage?: Message;
  unreadCounts?: Map<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  _id: string;
  investorId: User | string;
  sellerId: User | string;
  businessId: BusinessListing | string;
  investmentAmount: number;
  investmentType: "equity" | "revenue_share";
  equityPercentage?: number;
  revenueSharePercentage?: number;
  terms: {
    duration?: number;
    conditions: string;
    exitStrategy?: string;
  };
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "active"
    | "completed"
    | "withdrawn";
  message?: string;
  sellerResponse?: string;
  escrowTransactionId?: string;
  contractId?: string;
  commissionPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  _id: string;
  transactionId: string;
  transactionType: "purchase" | "investment";
  amount: number;
  transactionAmount: number;
  status: "pending" | "collected" | "refunded";
  buyerId: string;
  sellerId: string;
  businessId: string;
  collectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  _id: string;
  transactionId: string;
  contractType: "purchase" | "investment";
  terms: {
    businessName: string;
    amount: number;
    commissionAmount: number;
    sellerPayout: number;
    specificTerms?: string;
  };
  pdfUrl: string;
  signatures: {
    buyer: boolean;
    seller: boolean;
    buyerSignedAt?: string;
    sellerSignedAt?: string;
    adminApproved: boolean;
    adminApprovedAt?: string;
    adminApprovedBy?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EscrowTransaction {
  _id: string;
  buyerId: User | string;
  sellerId: User | string;
  businessId: BusinessListing | string;
  amount: number;
  transactionType: "purchase" | "investment";
  relatedDocumentId?: string;
  commissionAmount: number;
  sellerPayout: number;
  status: "pending" | "holding" | "released" | "cancelled";
  escrowComTransactionId?: string;
  escrowComStatus?: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentData {
  businessId: string;
  investmentAmount: number;
  investmentType: "equity" | "revenue_share";
  equityPercentage?: number;
  revenueSharePercentage?: number;
  terms: {
    duration?: number;
    conditions: string;
    exitStrategy?: string;
  };
  message?: string;
}
