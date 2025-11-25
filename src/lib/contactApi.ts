import api from "./api";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactMessage = async (data: ContactFormData) => {
  const response = await api.post("/contact", data);
  return response.data;
};
