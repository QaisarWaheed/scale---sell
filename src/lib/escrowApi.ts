import api from "./api";

export interface PopulatedUser {
  _id: string;
  email: string;
  profile?: {
    name?: string;
    phone?: string;
    location?: string;
    avatarUrl?: string;
  };
}

export interface PopulatedBusiness {
  _id: string;
  title: string;
}

export interface EscrowTransaction {
  _id: string;
  buyerId: string | PopulatedUser;
  sellerId: string | PopulatedUser;
  businessId: string | PopulatedBusiness;
  amount: number;
  transactionType: "purchase" | "investment";
  relatedDocumentId?: string;
  commissionAmount: number;
  sellerPayout: number;
  status: "pending" | "holding" | "released" | "cancelled";
  escrowComTransactionId?: string;
  escrowComStatus?: string;
  paymentUrl?: string;
  escrowComData?: any;
  logs: {
    action: string;
    timestamp: string;
    user: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const initiateTransaction = async (
  businessId: string,
  amount: number
) => {
  const response = await api.post("/escrow", { businessId, amount });
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get("/escrow");
  return response.data;
};

export const getTransaction = async (id: string) => {
  const response = await api.get(`/escrow/${id}`);
  return response.data;
};

export const updateStatus = async (id: string, status: string) => {
  const response = await api.put(`/escrow/${id}/status`, { status });
  return response.data;
};
