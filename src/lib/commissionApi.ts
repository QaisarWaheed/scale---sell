import api from "./api";
import { Commission } from "@/types";

export const commissionApi = {
  // Get total commissions (Admin only)
  getTotal: async () => {
    const response = await api.get<{
      totalCollected: number;
      totalPending: number;
      count: number;
    }>("/commissions/total");
    return response.data;
  },

  // Get commission statistics (Admin only)
  getStats: async () => {
    const response = await api.get<{
      byType: Array<{
        _id: string;
        total: number;
        count: number;
      }>;
      monthly: Array<{
        _id: { year: number; month: number };
        total: number;
        count: number;
      }>;
    }>("/commissions/stats");
    return response.data;
  },

  // Get commissions by period (Admin only)
  getByPeriod: async (startDate: string, endDate: string) => {
    const response = await api.get<Commission[]>("/commissions/period", {
      params: { start: startDate, end: endDate },
    });
    return response.data;
  },

  // Get commission details by ID (Admin only)
  getDetails: async (id: string) => {
    const response = await api.get<Commission>(`/commissions/${id}`);
    return response.data;
  },

  // Get all commissions with pagination (Admin only)
  getAll: async (page: number = 1, limit: number = 20) => {
    const response = await api.get<{
      commissions: Commission[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
      };
    }>("/commissions", {
      params: { page, limit },
    });
    return response.data;
  },
};
