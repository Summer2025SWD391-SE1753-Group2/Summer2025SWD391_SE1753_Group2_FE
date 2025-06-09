import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import HomePage from "@/pages/user/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { GoogleCallbackPage } from "@/pages/auth/GoogleCallbackPage";
import NotFound from "@/pages/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProfilePage from "@/pages/user/profile/ProfilePage";
import TagManagerPage from "@/pages/user/tag-manager/TagManagerPage";


const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutWrapper />,
    errorElement: <div>Route Error</div>,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path:"/profile",
        element: <ProfilePage />,
      },
      {
        path:"/tag-manager",
        element: <TagManagerPage />,
      },
      {
        path:"/profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
  },
  {
    path: "/auth/google/callback",
    element: <GoogleCallbackPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export const AppRouter = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
