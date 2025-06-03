import { RouteConfig } from "../../types/router.types";
import LoginPage from "@/pages/auth/user/login-register/LoginPage";
import RegisterPage from "@/pages/auth/user/login-register/RegisterPage";
import { VerifyPhonePage } from "@/pages/auth/user/verify-phone/VerifyPhonePage";

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
