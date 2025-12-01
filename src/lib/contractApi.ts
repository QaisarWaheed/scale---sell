import api from "./api";
import { Contract } from "@/types";

export const contractApi = {
  // Create a contract for a transaction
  create: async (transactionId: string) => {
    const response = await api.post<Contract>("/contracts", { transactionId });
    return response.data;
  },

  // Get contract by transaction ID
  getByTransaction: async (transactionId: string) => {
    const response = await api.get<Contract>(`/contracts/${transactionId}`);
    return response.data;
  },

  // Sign a contract
  sign: async (id: string) => {
    const response = await api.put<Contract>(`/contracts/${id}/sign`);
    return response.data;
  },

  // Get all user contracts
  getUserContracts: async () => {
    const response = await api.get<Contract[]>("/contracts/user/all");
    return response.data;
  },

  // Admin approve contract
  adminApprove: async (id: string) => {
    const response = await api.put<Contract>(`/contracts/${id}/admin/approve`);
    return response.data;
  },

  // Get all contracts (admin only)
  getAllContracts: async () => {
    const response = await api.get<Contract[]>("/contracts/all");
    return response.data;
  },
};
