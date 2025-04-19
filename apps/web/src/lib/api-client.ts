import axios, { AxiosError } from "axios";

const BACKEND_URL =
  import.meta.env.VITE_MODE === "development"
    ? "http://localhost:5000/api/v1"
    : import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("user-token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export const axiosError = AxiosError;
