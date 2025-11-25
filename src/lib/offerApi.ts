import api from "./api";
import { Offer } from "@/types";

export const createOffer = async (data: Partial<Offer>): Promise<Offer> => {
  const response = await api.post("/offers", data);
  return response.data;
};

export const getMyOffers = async (): Promise<Offer[]> => {
  const response = await api.get("/offers/buyer");
  return response.data;
};

export const getIncomingOffers = async (): Promise<Offer[]> => {
  const response = await api.get("/offers/seller");
  return response.data;
};

export const approveOffer = async (id: string): Promise<Offer> => {
  const response = await api.put(`/offers/${id}/approve`);
  return response.data;
};

export const rejectOffer = async (
  id: string,
  reason: string
): Promise<Offer> => {
  const response = await api.put(`/offers/${id}/reject`, { reason });
  return response.data;
};

export const withdrawOffer = async (id: string): Promise<Offer> => {
  const response = await api.put(`/offers/${id}/withdraw`);
  return response.data;
};
