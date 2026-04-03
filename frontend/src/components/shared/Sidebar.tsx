import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { navigationItems } from "../../constants/navigation";

export const Sidebar = () => {
  return (
    <aside className="hidden w-64 border-r border-accent/10 bg-surface-secondary/80 p-4 backdrop-blur-glass md:block">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2">
          <img src={logo} alt="leadsGrid" className="h-10 w-10" />
          <p className="text-2xl uppercase tracking-[0.20em] text-content-tertiary">leadsGrid</p>
        </div>
        <h1 className="mt-1 text-center italic text-content-tertiary font-light">leads to revenue</h1>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-glass-sm border px-3 py-2 text-sm transition-all duration-200 ${isActive
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
