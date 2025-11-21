import api from "./api";

export const getTransactions = async () => {
  const response = await api.get("/escrow");
  return response.data;
};

export const initiateTransaction = async (data: {
  businessId: string;
  amount: number;
}) => {
  const response = await api.post("/escrow", data);
  return response.data;
};

export const updateTransactionStatus = async (id: string, status: string) => {
  const response = await api.put(`/escrow/${id}/status`, { status });
  return response.data;
};
