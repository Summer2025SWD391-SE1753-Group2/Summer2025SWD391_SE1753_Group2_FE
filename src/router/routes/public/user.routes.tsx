import { RouteConfig } from "../../types/router.types";
import UserLayout from "@/components/layout/user/UserLayout";
import HomePage from "@/pages/user/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import NotFound from "@/pages/NotFound";

export const userRoutes: RouteConfig[] = [
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  { path: "*", element: <NotFound /> },
];
