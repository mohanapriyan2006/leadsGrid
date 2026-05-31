import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { GradientText } from "../ui/GradientText";

const WITHOUT = [
  "Manual searching for hours",
  "Low-quality, irrelevant leads",
  "No intent filtering",
  "Wasted outreach effort",
];

const WITH = [
  "AI finds real buyers automatically",
  "High-intent leads only",
  "Automated workflow end-to-end",
  "Close deals 5x faster",
];

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
};

export const WhyLeadsGridSection = () => {
  return (
    <SectionWrapper>
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Why <GradientText>LeadsGrid</GradientText>?
        </h2>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Without */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-2xl border border-danger/10 bg-danger/[0.03] p-8 shadow-[0_0_40px_rgba(239,68,68,0.06)]"
        >
          <h3 className="mb-6 font-display text-xl font-bold text-danger">
            Without LeadsGrid
          </h3>
          <ul className="space-y-4">
            {WITHOUT.map((item, idx) => (
              <motion.li
                key={item}
                custom={idx}
                variants={listItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-3 text-sm text-content-secondary"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger/20 text-xs text-danger">
                  <X className="w-3 h-3" />
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* With */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-2xl border border-success/10 bg-success/[0.03] p-8 shadow-[0_0_40px_rgba(16,185,129,0.06)]"
        >
          <h3 className="mb-6 font-display text-xl font-bold text-success">
            With LeadsGrid
          </h3>
          <ul className="space-y-4">
            {WITH.map((item, idx) => (
              <motion.li
                key={item}
                custom={idx}
                variants={listItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-3 text-sm text-content-secondary"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-xs text-success">
                  <Check className="w-3 h-3" />
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};
