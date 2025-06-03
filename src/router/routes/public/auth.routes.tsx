import { type RouteObject } from "react-router-dom";
import { LoginPage } from "@/pages/auth/user/login/LoginPage";
import { RegisterPage } from "@/pages/auth/user/register/RegisterPage";
import { VerifyPhonePage } from "@/pages/auth/user/verify-phone/VerifyPhonePage";

export const authRoutes: RouteObject[] = [
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
