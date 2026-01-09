import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("examsec_token");
  // console.log("Request token:", token); // Debugging
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
