import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { userPublicRoutes } from "./routes/public/user.routes";
import { authRoutes } from "./routes/public/auth.routes";
import { userRoutes } from "./routes/private/user.routes";
import { moderatorRoutes } from "./routes/private/moderator.routes";
import { adminRoutes } from "./routes/private/admin.routes";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  ...userPublicRoutes,
  ...authRoutes,
  ...userRoutes,
  ...moderatorRoutes,
  ...adminRoutes,
  { path: "*", element: <NotFound /> },
] as RouteObject[]);
