import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { userPublicRoutes } from "./routes/public/user.routes";
import { moderatorRoutes } from "./routes/private/moderator.routes";
import { adminRoutes } from "./routes/private/admin.routes";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const router = createBrowserRouter([
  ...userPublicRoutes,
  ...moderatorRoutes,
  ...adminRoutes,
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export const AppRouter = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
