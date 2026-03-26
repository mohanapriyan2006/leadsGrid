import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  timeout: 15000,
});

export const withAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getStoredToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("pitchpilot_token");
};
