import { useEffect, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";

import { MobileNavDrawer } from "../../components/shared/MobileNavDrawer";
import { Sidebar } from "../../components/shared/Sidebar";
import { Topbar } from "../../components/shared/Topbar";
import { LimitReachedModal } from "../../features/billing/components/LimitReachedModal";
import { useLimitModal } from "../../features/billing/hooks/useLimitModal";

export const AppShell = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isPageFocused = searchParams.get("focus") === "1";
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { open: limitModalOpen, modalData, close: closeLimitModal } = useLimitModal();

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className={isPageFocused ? "min-h-screen" : "min-h-screen bg-surface md:flex"}>
      {isPageFocused ? null : <Sidebar />}
      <div className="flex min-h-screen flex-1 flex-col">
        {isPageFocused ? null : <Topbar onOpenMobileNav={() => setIsMobileNavOpen(true)} />}
        <main className={isPageFocused ? "focus-shell" : "shell-main"}>
          <Outlet />
        </main>
      </div>
      {isPageFocused ? null : <MobileNavDrawer open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />}
      <LimitReachedModal open={limitModalOpen} data={modalData} onClose={closeLimitModal} />
    </div>
  );
};
