import { Routes, Route } from "react-router-dom";


import PublicRoute from "@/router/PublicRoute";
import PrivateRoute from "@/router/PrivateRoute";
import Login from "@/pages/auth/user/Login";
import Home from "@/pages/auth/user/Home";
import LoginPage from "@/pages/auth/user/Login";
import RegisterPage from "@/pages/auth/user/Register";
import UserLayout from "@/components/layout/user-layout";
import HomePage from "@/pages/auth/user/Home";
import ErrorPage from "@/pages/auth/user/ErrorPage";
import ModeratorLayout from "@/components/layout/moderator-layout";
import ModeratorDashboard from "@/pages/auth/moderator/moderator-dashboard";
import AdminLayout from "@/components/layout/admin-layout";
import AdminDashboard from "@/pages/auth/admin/admin-dashboard";




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

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<AdminDashboard />} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;
