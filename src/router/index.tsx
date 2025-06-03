import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { userRoutes as userPublicRoutes } from "./routes/public/user.routes";
import { authRoutes } from "./routes/public/auth.routes";
import { userRoutes as userPrivateRoutes } from "./routes/private/user.routes";
import { moderatorRoutes } from "./routes/private/moderator.routes";
import { adminRoutes } from "./routes/private/admin.routes";
import NotFound from "@/pages/NotFound";
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

export const router = createBrowserRouter([
  ...convertRouteConfigToRouteObject(userPublicRoutes),
  ...convertRouteConfigToRouteObject(authRoutes),
  ...convertRouteConfigToRouteObject(userPrivateRoutes),
  ...convertRouteConfigToRouteObject(moderatorRoutes),
  ...convertRouteConfigToRouteObject(adminRoutes),
  { path: "*", element: <NotFound /> },
]);
