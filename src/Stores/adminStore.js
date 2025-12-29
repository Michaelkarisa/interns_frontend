import { create } from 'zustand';
import api from '@/assets/apiClient';

export const useAdminStore = create((set) => ({
  auth: null,
  pageData: null,
  activePage: 'dashboard',
  loading: false,
  error: null,
  collapsed: JSON.parse(localStorage.getItem('sidebarCollapsed')) || false,

  // 🔔 FLASH STATE
  flash: null, // { type: 'success' | 'error', message: string }

  showFlash: (message, type = 'success') => {
    set({ flash: { message, type } });

    // auto hide after 3s
    setTimeout(() => {
      set({ flash: null });
    }, 3000);
  },

  clearFlash: () => set({ flash: null }),

  // Fetch authenticated user
  fetchAuth: async () => {
    try {
      const response = await api.get('/me');
      set({ auth: response.data });
    } catch (err) {
      console.error('Error fetching auth:', err);
      set({ auth: null });
    }
  },

  // Fetch dashboard/section data
  fetchPageData: async (page) => {
    set({ activePage: page, loading: true, error: null });
    try {
      const response = await api.get(`/${page}`);
      set({ pageData: response.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        pageData: null,
        loading: false,
      });
    }
  },

  toggleSidebar: () =>
    set((state) => {
      const newState = !state.collapsed;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      return { collapsed: newState };
    }),
}));
