import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from "react-router-dom";
import { userPublicRoutes } from "./routes/public/user.routes";
import { authRoutes } from "./routes/public/auth.routes";
import { userRoutes } from "./routes/private/user.routes";
import { moderatorRoutes } from "./routes/private/moderator.routes";
import { adminRoutes } from "./routes/private/admin.routes";
import NotFound from "@/pages/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteConfig } from "./types/router.types";

function convertRouteConfigToRouteObject(routes: RouteConfig[]): RouteObject[] {
  return routes.map(({ children, index, ...route }) => {
    const result: RouteObject = { ...route };
    if (children) {
      result.children = convertRouteConfigToRouteObject(
        children as RouteConfig[]
      );
    }
    if (index) {
      (result as unknown as { index: true }).index = true;
    }
    return result;
  });
}

const router = createBrowserRouter([
  ...userPublicRoutes,
  ...convertRouteConfigToRouteObject(authRoutes),
  ...convertRouteConfigToRouteObject(userRoutes),
  ...moderatorRoutes,
  ...convertRouteConfigToRouteObject(adminRoutes),
  { path: "*", element: <NotFound /> },
]);

export const AppRouter = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
