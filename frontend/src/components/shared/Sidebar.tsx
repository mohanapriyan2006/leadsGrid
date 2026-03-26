import { NavLink } from "react-router-dom";

import { navigationItems } from "../../constants/navigation";

export const Sidebar = () => {
  return (
    <aside className="hidden w-64 border-r border-white/10 bg-black/25 p-4 md:block">
      <div className="mb-8 px-2">
        <NavLink to="/" className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-accentSoft to-indigo-600 text-sm font-black text-white">
          K
        </NavLink>
        <p className="text-xs uppercase tracking-[0.25em] text-text-dim">PitchPilot</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Sales Engine Active</h1>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg border px-3 py-2 text-sm transition ${
                isActive
                  ? "border-accent/50 bg-accent/15 text-white shadow-[0_0_0_1px_rgba(181,149,255,0.35)]"
                  : "border-transparent text-text-dim hover:border-white/10 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
