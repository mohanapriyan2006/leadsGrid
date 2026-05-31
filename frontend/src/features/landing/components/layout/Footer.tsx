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
          {FOOTER_LINKS.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-sm font-semibold text-content-secondary">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <span className="cursor-pointer text-sm   transition-colors hover:text-content-secondary">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
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
