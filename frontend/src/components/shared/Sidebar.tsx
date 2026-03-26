import { NavLink } from "react-router-dom";

import { navigationItems } from "../../constants/navigation";

export const Sidebar = () => {
  return (
    <aside className="hidden w-64 border-r border-white/10 bg-black/20 p-4 md:block">
      <div className="mb-8 px-2">
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
                  ? "border-accent/50 bg-accent/10 text-white"
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
