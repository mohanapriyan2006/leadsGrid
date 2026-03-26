import { Outlet } from "react-router-dom";

import { Sidebar } from "../../components/shared/Sidebar";
import { Topbar } from "../../components/shared/Topbar";

export const AppShell = () => {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
