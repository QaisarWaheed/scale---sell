import api from "./api";
import type {
  BusinessListing,
  ListingQueryParams,
  CreateListingData,
  UpdateListingData,
} from "@/types/listing";

export const getListings = async (
  params?: ListingQueryParams
): Promise<BusinessListing[]> => {
  const response = await api.get("/listings", { params });
  return response.data;
};

export const getListingById = async (id: string): Promise<BusinessListing> => {
  const response = await api.get(`/listings/${id}`);
  return response.data;
};

export const createListing = async (
  data: CreateListingData
): Promise<BusinessListing> => {
  const response = await api.post("/listings", data);
  return response.data;
};

export const updateListing = async (
  id: string,
  data: UpdateListingData
): Promise<BusinessListing> => {
  const response = await api.put(`/listings/${id}`, data);
  return response.data;
};

export const deleteListing = async (id: string): Promise<void> => {
  const response = await api.delete(`/listings/${id}`);
  return response.data;
};

export const getMyListings = async (): Promise<BusinessListing[]> => {
  const response = await api.get("/listings/my-listings");
  return response.data;
};
