import api from "./api";

// User Management
export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const createUser = async (userData: {
  email: string;
  role: string;
  name?: string;
  phone?: string;
  location?: string;
}) => {
  const response = await api.post("/admin/users", userData);
  return response.data;
};

export const updateUser = async (
  userId: string,
  userData: {
    email?: string;
    role?: string;
    name?: string;
    phone?: string;
    location?: string;
    avatarUrl?: string;
  }
) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// System Stats
export const getSystemStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// Listing Management
export const getAllListings = async () => {
  const response = await api.get("/admin/listings");
  return response.data;
};

export const getPendingListings = async () => {
  const response = await api.get("/admin/listings/pending");
  return response.data;
};

export const approveListing = async (listingId: string) => {
  const response = await api.put(`/admin/listings/${listingId}/approve`);
  return response.data;
};

export const rejectListing = async (listingId: string) => {
  const response = await api.put(`/admin/listings/${listingId}/reject`);
  return response.data;
};

export const deleteListing = async (listingId: string) => {
  const response = await api.delete(`/admin/listings/${listingId}`);
  return response.data;
};
