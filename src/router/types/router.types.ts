import { ReactNode } from "react";

export type UserRole =
  | "guest"
  | "user"
  | "verified_user"
  | "moderator"
  | "admin";

export interface RouteConfig {
  path?: string;
  element: ReactNode;
  children?: RouteConfig[];
  guard?: ReactNode;
  roles?: UserRole[];
  requirePhoneVerification?: boolean;
  index?: boolean;
}

export interface GuardProps {
  children: ReactNode;
  roles?: UserRole[];
  requirePhoneVerification?: boolean;
}
