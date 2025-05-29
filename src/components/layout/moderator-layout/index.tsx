import Sidebar from "@/components/layout/moderator-layout/Sidebar";
import Topbar from "@/components/layout/moderator-layout/Topbar";
import { Outlet } from "react-router-dom";

export default function ModeratorLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1  p-2 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}