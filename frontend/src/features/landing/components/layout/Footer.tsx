import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GradientText } from "../ui/GradientText";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

export const Footer = () => {
  return (
    <footer className="border-t border-content/5 bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...spring, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 pb-4">
              <img src="/logo.png" alt="LeadsGrid" className="h-8 w-8" />
              <GradientText className="text-xl font-bold">LeadsGrid</GradientText>
            </div>
            <p className="text-sm leading-relaxed text-content-secondary">
              AI-powered lead discovery platform that finds high-intent clients
              automatically.
            </p>
          </motion.div>

          {/* Link columns */}
          {FOOTER_LINKS.map((column, colIdx) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, duration: 0.6, delay: colIdx * 0.1 }}
            >
              <h4 className="mb-4 text-sm font-semibold text-content-secondary">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...spring, delay: colIdx * 0.1 + linkIdx * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      className="cursor-pointer text-sm text-content-secondary transition-colors duration-300 hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.3 }}
          className="mt-12 border-t border-content/5 pt-8 text-center"
        >
          <p className="text-xs text-content-secondary">
            &copy; {new Date().getFullYear()} LeadsGrid. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
