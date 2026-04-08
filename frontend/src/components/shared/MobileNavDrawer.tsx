import { useEffect } from "react";
import { NavLink } from "react-router-dom";

import { navigationItems } from "../../constants/navigation";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const MobileNavDrawer = ({ open, onClose }: MobileNavDrawerProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-surface/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="relative z-10 h-full w-[min(82vw,320px)] border-r border-accent/20 bg-surface-secondary/95 p-4 backdrop-blur-glass">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-content-tertiary">Navigation</p>
          <button type="button" className="glass-btn px-2 py-1 text-[11px]" onClick={onClose}>
            Close
          </button>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-glass-sm border px-3 py-2.5 text-sm transition-all duration-200 ${isActive
                  ? "border-accent/40 bg-accent-soft text-content shadow-glow"
                  : "border-transparent text-content-secondary hover:border-accent/15 hover:bg-accent-soft/50 hover:text-content"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
};