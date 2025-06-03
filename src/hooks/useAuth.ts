import { UserRole } from "../router/types/router.types";

interface User {
  id: string;
  role: UserRole;
  isPhoneVerified: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export const useAuth = () => {
  // Tạm thời trả về state giả
  const authState: AuthState = {
    isAuthenticated: false,
    user: null,
  };

  return authState;
};
