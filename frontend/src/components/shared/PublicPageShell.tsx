import type { ReactNode } from "react";

import { Footer } from "../../features/landing/components/layout/Footer";
import { Navbar } from "../../features/landing/components/layout/Navbar";
import { CursorGlow } from "../../features/landing/components/ui/CursorGlow";
import { NoiseOverlay } from "../../features/landing/components/ui/NoiseOverlay";

type NavLink = {
  label: string;
  href: string;
};

type Props = {
  children: ReactNode;
  navLinks?: NavLink[];
  showProgress?: boolean;
};

export const PublicPageShell = ({ children, navLinks, showProgress = false }: Props) => {
  return (
    <div className="relative min-h-screen bg-surface text-content">
      <CursorGlow />
      <NoiseOverlay />
      <Navbar links={navLinks} showProgress={showProgress} />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  );
};