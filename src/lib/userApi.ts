import api from "./api";
import type { UpdateProfileData } from "@/types/profile";

export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateProfile = async (data: UpdateProfileData) => {
  const response = await api.put("/users/profile", data);
  return response.data;
};
