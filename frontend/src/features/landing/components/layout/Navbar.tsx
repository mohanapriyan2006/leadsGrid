import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { GradientText } from "../ui/GradientText";
import { GlowButton } from "../ui/GlowButton";
import { ThemeToggle } from "../../../../components/ui/ThemeToggle";

type NavLink = {
  label: string;
  href: string;
};

type Props = {
  links?: NavLink[];
  showProgress?: boolean;
};

const DEFAULT_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export const Navbar = ({ links = DEFAULT_LINKS, showProgress = true }: Props) => {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hasScrollLinks = links.some((link) => link.href.startsWith("#"));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (showProgress) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        setProgress(pct);
      }

      if (hasScrollLinks) {
        const offset = window.innerHeight * 0.35;
        let closest: string | null = null;
        let closestDist = Infinity;

        links.forEach((link) => {
          if (!link.href.startsWith("#")) {
            return;
          }
          const el = document.querySelector(link.href);
          if (el) {
            const rect = el.getBoundingClientRect();
            const dist = Math.abs(rect.top - offset);
            if (dist < closestDist) {
              closestDist = dist;
              closest = link.href;
            }
          }
        });
        setActiveSection(closest);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrollLinks, links, showProgress]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        const navHeight = navRef.current?.offsetHeight || 64;
        const targetY = element.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
      return;
    }

    navigate(href);
  };

  // const backdropIntensity = scrolled
  //   ? "bg-surface/70 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
  //   : "bg-transparent";

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed left-0 right-0 top-1 z-50 transition-all duration-300 bg-transparent`}
    >
      {/* Scroll progress bar */}
      {showProgress ? (
        <div className="absolute -bottom-1 left-0 h-[2px] w-full bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      <div className={`mx-auto max-w-7xl px-6 transition-all duration-300`}>
        <div className="flex items-center justify-between rounded-full border border-content/5 bg-surface/30 px-4 py-2 shadow-[0_6px_22px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <button
            onClick={() => {
              if (location.pathname !== "/") {
                navigate("/");
                return;
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex items-center gap-2 text-xl font-bold tracking-tight transition-transform duration-300 ${scrolled ? "scale-[0.98]" : "scale-100"}`}
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-content/10 bg-surface-tertiary/60">
              <img src="/logo.png" alt="LeadsGrid" className="h-5 w-5" />
            </span>
            <GradientText className="text-lg font-bold sm:text-xl">LeadsGrid</GradientText>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-content/10 bg-surface-secondary/50 px-2 py-1 md:flex">
            {links.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "text-content-secondary hover:text-content"
                  }`}
                >
                  {link.label}
                  <motion.span
                    className="absolute inset-x-4 -bottom-0.5 h-[2px] bg-accent/80"
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, scaleX: isActive ? 1 : 0.4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <ThemeToggle />
              <button
                onClick={() => navigate("/login")}
                className="rounded-full px-4 py-2 text-sm text-content-secondary transition-colors hover:text-content"
              >
                Log in
              </button>
            </div>
            <GlowButton onClick={() => navigate("/login")} className="hidden text-xs !px-5 !py-2.5 sm:inline-flex">
              Start Free
            </GlowButton>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-content/10 bg-surface-secondary/50 text-content md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full mt-2 mx-4 rounded-2xl border border-content/10 bg-surface/95 p-5 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent/15 text-accent"
                        : "text-content-secondary hover:bg-surface-secondary/70 hover:text-content"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
              <div className="mt-2 flex flex-col gap-2 border-t border-content/10 pt-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs text-content-secondary">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => handleNavClick("/login")}
                  className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-content-secondary hover:bg-surface-secondary/70 hover:text-content"
                >
                  Log in
                </button>
                <GlowButton onClick={() => handleNavClick("/login")} className="w-full !py-2.5">
                  Start Free
                </GlowButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
