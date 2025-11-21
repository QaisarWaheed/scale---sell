import api from "./api";

export const getListings = async (params?: any) => {
  const response = await api.get("/listings", { params });
  return response.data;
};

export const getListingById = async (id: string) => {
  const response = await api.get(`/listings/${id}`);
  return response.data;
};

export const createListing = async (data: any) => {
  const response = await api.post("/listings", data);
  return response.data;
};

export const updateListing = async (id: string, data: any) => {
  const response = await api.put(`/listings/${id}`, data);
  return response.data;
};

export const deleteListing = async (id: string) => {
  const response = await api.delete(`/listings/${id}`);
  return response.data;
};

export const getMyListings = async () => {
  const response = await api.get("/listings/my-listings");
  return response.data;
};
