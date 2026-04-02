import { NavLink } from "react-router-dom";

import { navigationItems } from "../../constants/navigation";

export const Sidebar = () => {
  return (
    <aside className="hidden w-64 border-r border-accent/10 bg-surface-secondary/80 p-4 backdrop-blur-glass md:block">
      <div className="mb-8 px-2">
        <NavLink to="/" className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-glass-sm bg-gradient-to-br from-accent to-accent-secondary text-sm font-black text-content-inverse shadow-glow">
          K
        </NavLink>
        <p className="text-xs uppercase tracking-[0.25em] text-content-tertiary">PitchPilot</p>
        <h1 className="mt-2 text-2xl font-bold text-content">Sales Engine Active</h1>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-glass-sm border px-3 py-2 text-sm transition-all duration-200 ${
                isActive
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
  );
};
