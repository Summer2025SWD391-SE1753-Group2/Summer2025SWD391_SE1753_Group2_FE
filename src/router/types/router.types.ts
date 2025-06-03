import { ReactNode } from "react";

export type UserRole =
  | "guest"
  | "user"
  | "verified_user"
  | "moderator"
  | "admin";

export interface GuardProps {
  children: ReactNode;
  roles?: UserRole[];
  requirePhoneVerification?: boolean;
}
