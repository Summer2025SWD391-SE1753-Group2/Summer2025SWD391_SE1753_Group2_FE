import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/types/user-role';

interface RoleStore {
  tempRole: UserRole | undefined;
  setTempRole: (role: UserRole) => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      tempRole: undefined,
      setTempRole: (role) => set({ tempRole: role }),
    }),
    {
      name: 'temp-role-storage'
    }
  )
);
