import { type RouteObject } from "react-router-dom";
import UserLayout from "@/components/layout/auth/user";
import HomePage from "@/pages/user/HomePage";
import LoginPage from "@/pages/auth/user/login-register/LoginPage";
import RegisterPage from "@/pages/auth/user/login-register/RegisterPage";
import NotFound from "@/pages/NotFound";

export const userPublicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];
