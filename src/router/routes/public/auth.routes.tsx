import { RouteConfig } from "../../types/router.types";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyPhonePage } from "@/pages/auth/verify-phone/VerifyPhonePage";
import { GoogleCallbackPage } from "@/pages/auth/GoogleCallbackPage";

export const authRoutes: RouteConfig[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-phone",
    element: <VerifyPhonePage />,
  },
  {
    path: "/auth/google/callback",
    element: <GoogleCallbackPage />,
  },
];
