import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Nice error message extraction for UI
export function apiError(err, fallback = "Something went wrong") {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}
