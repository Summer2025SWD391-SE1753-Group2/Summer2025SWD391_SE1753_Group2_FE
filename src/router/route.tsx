// router/route.tsx
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import LoginPage from "@/pages/auth/user/Login";
import HomePage from "@/pages/auth/user/Home";
import RegisterPage from "@/pages/auth/user/Register";
import UserLayout from "@/components/layout/user-layout";
import AdminLayout from "@/components/layout/admin-layout";
import ModeratorLayout from "@/components/layout/moderator-layout";
import ModeratorDashboard from "@/pages/auth/moderator/moderator-dashboard";
import AdminDashboard from "@/pages/auth/admin/admin-dashboard";
import ErrorPage from "@/pages/auth/user/ErrorPage";




const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/*" element={<ErrorPage />} />

        </Route>
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/moderator" element={<ModeratorLayout />}>
          <Route index element={<ModeratorDashboard />} />
          
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
