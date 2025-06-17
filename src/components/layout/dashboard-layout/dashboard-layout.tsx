import { Outlet } from "react-router-dom";
import DashboardSidebar from "./sidebar";
import DashboardHeader from "./header";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Main content */}
        <main className="">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
