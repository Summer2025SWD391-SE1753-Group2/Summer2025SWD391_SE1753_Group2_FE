import { Routes, Route } from "react-router-dom";
import PublicRoute from "@/router/PublicRoute";
import PrivateRoute from "@/router/PrivateRoute";
import LoginPage from "@/pages/auth/user/Login";
import RegisterPage from "@/pages/auth/user/Register";
import UserLayout from "@/components/layout/user-layout";
import HomePage from "@/pages/auth/user/Home";
import ErrorPage from "@/pages/auth/user/ErrorPage";
import ModeratorLayout from "@/components/layout/moderator-layout";
import ModeratorDashboard from "@/pages/auth/moderator/moderator-dashboard";
import AdminLayout from "@/components/layout/admin-layout";
import AdminDashboard from "@/pages/auth/admin/admin-dashboard";
import ForgotPasswordPage from "@/pages/auth/user/ForgotPassword";
import SplashPage from "@/pages/auth/user/SplashPage";


const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>


        <Route element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/splash-page" element={<SplashPage />} />
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
