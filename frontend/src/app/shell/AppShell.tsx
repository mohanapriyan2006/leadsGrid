import { Outlet, useSearchParams } from "react-router-dom";

import { Sidebar } from "../../components/shared/Sidebar";
import { Topbar } from "../../components/shared/Topbar";

export const AppShell = () => {
  const [searchParams] = useSearchParams();
  const isPageFocused = searchParams.get("focus") === "1";

  return (
    <div className={isPageFocused ? "min-h-screen" : "min-h-screen md:flex"}>
      {isPageFocused ? null : <Sidebar />}
      <div className="flex-1">
        {isPageFocused ? null : <Topbar />}
        <main className={isPageFocused ? "focus-shell" : ""}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
