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
  escrowTransactionId?: string;
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
  senderId: string;
  receiverId: string;
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
