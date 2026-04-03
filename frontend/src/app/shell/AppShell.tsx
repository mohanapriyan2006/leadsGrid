import { Outlet } from "react-router-dom";

import { Sidebar } from "../../components/shared/Sidebar";
import { Topbar } from "../../components/shared/Topbar";

export const AppShell = () => {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
