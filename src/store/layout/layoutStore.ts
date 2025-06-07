import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeAll: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isMobileMenuOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeAll: () => set({ isSidebarOpen: false, isMobileMenuOpen: false }),
    }),
    {
      name: "layout-storage",
    }
  )
);
