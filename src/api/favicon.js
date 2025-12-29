// src/Stores/appStore.js
import { create } from "zustand";
import api from "./apiClient";


export const useAppStore = create((set) => ({
  appName: "Loading...",
  favicon: null,
  company: null,

  loadCompany: async () => {
    try {
      const res = await api.get("/company");
      const company = res?.data?.data;

      if (!company) return;

      document.title = company.system_name || "InternTrack";

      if (company.appIcon) {
        let link =
          document.querySelector("link[rel='icon']") ||
          document.createElement("link");

        link.rel = "icon";
        link.type = "image/png";
        link.href = `${company.appIcon}?v=${Date.now()}`;

        document.head.appendChild(link);
      }

      set({
        appName: company.system_name|| "InternTrack",
        favicon: company.appIcon,
        company,
      });
    } catch (err) {
      console.error("❌ Branding load failed", err);
    }
  },
}));
