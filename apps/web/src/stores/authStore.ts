import { create } from "zustand";
import { api, axiosError } from "@/lib/api-client";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthStore {
  User: User | null;
  isCheckingAuth: boolean;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  User: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  checkAuth: async () => {
    try {
      const token = localStorage.getItem("user-token");
      if (!token) {
        set({ isCheckingAuth: false });
        return;
      }
      const { data } = await api.get<{ user: User }>("auth/me");

      set({ User: data.user });
    } catch (error) {
      console.error("Error in checkAuth: ", error);
      localStorage.removeItem("user-token");
      set({ User: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoggingIn: true });
    try {
      const { data } = await api.post<{ user: User; message: string }>(
        "/auth/login",
        {
          email,
          password,
        },
      );
      localStorage.setItem("user-token", data.user.token);
      toast.success(data.message || "Login successful!", {
        description: "Redirecting to dashboard...",
      });
      set({ User: data.user });
    } catch (error) {
      console.error("Error in login: ", error);
      const message =
        error instanceof axiosError
          ? error.response?.data.message || "Login failed."
          : "Login failed.";
      console.log(message);
      toast.error(message, {
        description: "Please try again later.",
      });
      localStorage.removeItem("user-token");
      set({ User: null });
    } finally {
      set({ isLoggingIn: false });
    }
  },
  signup: async (name: string, email: string, password: string) => {
    set({ isSigningUp: true });
    try {
      const { data } = await api.post<{ user: User; message: string }>(
        "/auth/register",
        {
          name,
          email,
          password,
        },
      );
      localStorage.setItem("user-token", data.user.token);
      set({ User: data.user });
      toast.success(data.message || "Registration successful!", {
        description: "Redirecting to dashboard...",
      });
    } catch (error) {
      console.error("Error in signup: ", error);
      const message =
        error instanceof axiosError
          ? error.response?.data.message || "Signup failed."
          : "Signup failed.";
      toast.error(message, {
        description: "Please try again later.",
      });
      localStorage.removeItem("user-token");
      set({ User: null });
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: () => {
    localStorage.removeItem("user-token");
    set({ User: null });
  },
}));
