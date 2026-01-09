import axios from "axios";
import { useMemo } from "react";
import { useAuth } from "./useAuth";

export function useApi() {
  const { token } = useAuth();
  return useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000",
    });
    instance.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, [token]);
}
