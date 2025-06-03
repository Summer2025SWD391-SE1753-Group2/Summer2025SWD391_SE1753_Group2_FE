import { Navigate } from "react-router-dom";
import { GuardProps } from "../types/router.types";
import { useAuth } from "@/hooks/useAuth";

export const PhoneVerifiedGuard = ({
  children,
  requirePhoneVerification,
}: GuardProps) => {
  const { user } = useAuth();

  if (!requirePhoneVerification || !user) {
    return <>{children}</>;
  }

  if (!user.isPhoneVerified) {
    return <Navigate to="/verify-phone" replace />;
  }

  return <>{children}</>;
};
