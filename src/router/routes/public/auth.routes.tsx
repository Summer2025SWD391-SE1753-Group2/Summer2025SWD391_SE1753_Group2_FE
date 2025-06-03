import { RouteConfig } from "../../types/router.types";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyPhonePage } from "@/pages/auth/verify-phone/VerifyPhonePage";

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
];
