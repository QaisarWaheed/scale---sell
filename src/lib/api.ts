import axios from "axios";
import { supabase } from "@/integrations/supabase/client";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust if your backend runs on a different port
});

// Add a request interceptor to attach the Supabase token
api.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
