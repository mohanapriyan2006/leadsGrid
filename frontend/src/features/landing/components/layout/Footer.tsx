import { motion } from "framer-motion";
import { GradientText } from "../ui/GradientText";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-content/5 bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 pb-4">
              <img src="/logo.png" alt="LeadsGrid" className="h-8 w-8" />
              <GradientText className="text-xl font-bold">LeadsGrid</GradientText>
            </div>
            <p className="text-sm leading-relaxed  ">
              AI-powered lead discovery platform that finds high-intent clients
              automatically.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((column, colIdx) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: colIdx * 0.1 }}
            >
              <h4 className="mb-4 text-sm font-semibold text-content-secondary">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: colIdx * 0.1 + linkIdx * 0.05 }}
                  >
                    <span className="cursor-pointer text-sm text-content-secondary transition-colors hover:text-content">
                      {link}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-content/5 pt-8 text-center">
          <p className="text-xs  ">
            &copy; {new Date().getFullYear()} LeadsGrid. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
