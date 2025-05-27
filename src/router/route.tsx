// router/route.tsx
import { Routes, Route } from "react-router-dom";


import PublicRoute from "@/router/PublicRoute";
import PrivateRoute from "@/router/PrivateRoute";
import Login from "@/pages/auth/user/Login";
import Home from "@/pages/auth/user/Home";
import Dashboard from "@/pages/auth/user/Dashboard";



const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
