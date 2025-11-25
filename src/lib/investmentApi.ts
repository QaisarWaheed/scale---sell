import api from "./api";
import { Investment, CreateInvestmentData } from "@/types";

export const investmentApi = {
  // Create a new investment offer
  create: async (data: CreateInvestmentData) => {
    const response = await api.post<Investment>("/investments", data);
    return response.data;
  },

  // Get investments made by the investor
  getInvestorInvestments: async () => {
    const response = await api.get<Investment[]>("/investments/investor");
    return response.data;
  },

  // Get investments received by the seller
  getSellerInvestments: async () => {
    const response = await api.get<Investment[]>("/investments/seller");
    return response.data;
  },

  // Get active investments
  getActiveInvestments: async () => {
    const response = await api.get<Investment[]>("/investments/active");
    return response.data;
  },

  // Get investment by ID
  getById: async (id: string) => {
    const response = await api.get<Investment>(`/investments/${id}`);
    return response.data;
  },

  // Approve an investment (seller)
  approve: async (id: string) => {
    const response = await api.put<Investment>(`/investments/${id}/approve`);
    return response.data;
  },

  // Reject an investment (seller)
  reject: async (id: string, reason: string) => {
    const response = await api.put<Investment>(`/investments/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  // Withdraw an investment (investor)
  withdraw: async (id: string) => {
    const response = await api.put<Investment>(`/investments/${id}/withdraw`);
    return response.data;
  },
};
