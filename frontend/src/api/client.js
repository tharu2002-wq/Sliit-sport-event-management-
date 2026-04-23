import axios from "axios";
import { getAuthToken } from "../utils/authStorage";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const isAuthEndpoint = (url = "") => {
  const path = String(url || "");
  return path.includes("/auth/login") || path.includes("/auth/register");
};

api.interceptors.request.use((config) => {
  if (isAuthEndpoint(config.url)) {
    return config;
  }

  // Prefer the new unified auth token key, then fall back to legacy keys.
  const token =
    getAuthToken() ||
    localStorage.getItem("adminAuthToken") ||
    localStorage.getItem("userAuthToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
