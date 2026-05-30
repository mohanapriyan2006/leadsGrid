import { motion } from "framer-motion";
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
        <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-8">
          <h3 className="mb-6 font-display text-xl font-bold text-red-400">
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
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-400">
                  ✕
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* With */}
        <div className="rounded-2xl border border-green-500/10 bg-green-500/[0.03] p-8">
          <h3 className="mb-6 font-display text-xl font-bold text-green-400">
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
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">
                  ✓
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </SectionWrapper>
  );
};
