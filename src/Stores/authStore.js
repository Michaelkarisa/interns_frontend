import { create } from "zustand";
import api from "@/apiClient";

export const useAuthStore = create((set, get) => ({
  user: null,
  forcePasswordChange: false,
  loading: true,
  initialized: false, // ⭐ IMPORTANT

  initAuth: async () => {
    if (get().initialized) return; // ⛔ prevent re-run

    set({ loading: true });

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        set({ user: null, loading: false, initialized: true });
        return;
      }

      const res = await api.get("/me");

      set({
        user: res.data,
        forcePasswordChange: res.data?.must_change_password ?? false,
        loading: false,
        initialized: true,
      });
    } catch {
      localStorage.removeItem("authToken");
      set({
        user: null,
        forcePasswordChange: false,
        loading: false,
        initialized: true,
      });
    }
  },

  login: async (credentials) => {
    const res = await api.post("/login", credentials);

    const { user, token } = res.data;

    localStorage.setItem("authToken", token);

    set({
      user,
      forcePasswordChange: user?.must_change_password ?? false,
    });

    return res.data;
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } catch {}

    localStorage.removeItem("authToken");

    set({
      user: null,
      forcePasswordChange: false,
      initialized: false,
    });
  },
}));
