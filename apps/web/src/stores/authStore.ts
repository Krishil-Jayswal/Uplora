import { create } from "zustand";
import { api } from "../lib/api-client";

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
    try {
      set({ isLoggingIn: true });
      const { data } = await api.post<{ user: User }>("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("user-token", data.user.token);
      set({ User: data.user });
    } catch (error) {
      console.error("Error in login: ", error);
      localStorage.removeItem("user-token");
      set({ User: null });
    } finally {
      set({ isLoggingIn: false });
    }
  },
  signup: async (name: string, email: string, password: string) => {
    try {
      set({ isSigningUp: true });
      const { data } = await api.post<{ user: User }>("/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("user-token", data.user.token);
      set({ User: data.user });
    } catch (error) {
      console.error("Error in signup: ", error);
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
