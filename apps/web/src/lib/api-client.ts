import axios, { AxiosError } from "axios";
import { Log, Status } from "@repo/validation";
const HTTP_API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : import.meta.env.VITE_API_URL;

const DEPLOY_API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : import.meta.env.VITE_DEPLOY_API_URL;

export const httpApi = axios.create({
  baseURL: HTTP_API_URL,
});

httpApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("user-token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export const deployApi = axios.create({
  baseURL: DEPLOY_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

httpApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("user-token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

deployApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("user-token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export type serializedLog = Omit<Log, "createdAt"> & { createdAt: string };

export const projectApi = {
  getStatus: (projectId: string) =>
    httpApi.get<{ status: Status }>(`api/v1/project/status/${projectId}`),

  getLogs: (projectId: string) =>
    httpApi.get<{ logs: serializedLog[] }>(`api/v1/project/logs/${projectId}`),
};

export const axiosError = AxiosError;
