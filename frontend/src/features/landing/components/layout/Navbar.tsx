import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GradientText } from "../ui/GradientText";
import { GlowButton } from "../ui/GlowButton";
import { ThemeToggle } from "../../../../components/ui/ThemeToggle";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setProgress(pct);

      // Scrollspy: find which section is closest to viewport top + offset
      const offset = window.innerHeight * 0.35;
      let closest: string | null = null;
      let closestDist = Infinity;

      NAV_LINKS.forEach((link) => {
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
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const navHeight = navRef.current?.offsetHeight || 64;
      const targetY = element.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  const backdropIntensity = scrolled
    ? "border-b border-content/5 bg-surface/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.15)]"
    : "bg-transparent";

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${backdropIntensity}`}
    >
      {/* Scroll progress bar */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 ${scrolled ? "py-2.5" : "py-4"}`}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`text-xl font-bold tracking-tight transition-transform duration-300 ${scrolled ? "scale-95" : "scale-100"}`}
        >
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="LeadsGrid" className="h-8 w-8" />
            <GradientText className="text-xl font-bold">LeadsGrid</GradientText>
          </div>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className={`relative text-sm transition-colors ${isActive ? "text-accent" : "text-content-secondary hover:text-content"}`}
              >
                {link.label}
                <motion.span
                  className="absolute -bottom-0.5 left-0 h-[2px] bg-accent shadow-[0_0_8px_rgba(167,139,250,0.6)]"
                  initial={false}
                  animate={{ width: isActive ? "100%" : "0%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-content-secondary transition-colors hover:text-content"
          >
            Log in
          </button>
          <GlowButton onClick={() => navigate("/login")} className="text-xs">
            Start Free
          </GlowButton>
        </div>
      </div>
    </motion.nav>
  );
};
