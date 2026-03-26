import { motion } from "framer-motion";

import { MetricWidget } from "../../components/ui/MetricWidget";
import { PanelCard } from "../../components/ui/PanelCard";

const metricItems = [
  { title: "Leads Captured", value: "1,284", delta: "+12.4% this week" },
  { title: "High Intent", value: "42", delta: "active queue" },
  { title: "Engagement", value: "86", delta: "response quality" },
  { title: "Efficiency", value: "6.4%", delta: "reply conversion" },
];

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -2, scale: 1.01 }}
          >
            <MetricWidget {...item} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <PanelCard className="xl:col-span-2">
          <h2 className="text-2xl font-semibold text-white">Signal Stream</h2>
          <p className="mt-1 text-sm text-text-dim">Pipeline-first feed from scored intent inputs.</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="rounded border border-white/10 bg-black/20 p-3">Scaling outbound workflows with AI - score 92</div>
            <div className="rounded border border-white/10 bg-black/20 p-3">Evaluating CRM replacements for Q3 - score 88</div>
            <div className="rounded border border-white/10 bg-black/20 p-3">Seeking multi-channel prospecting support - score 74</div>
          </div>
        </PanelCard>

        <PanelCard>
          <h2 className="text-2xl font-semibold text-white">System Health</h2>
          <div className="mt-4 space-y-3 text-sm text-text-dim">
            <p>Relevance: <span className="text-highlight">93.2%</span></p>
            <p>Sentiment Match: <span className="text-highlight">84.2%</span></p>
            <p>Latency Risk: <span className="text-red-300">9.6%</span></p>
          </div>
        </PanelCard>
      </section>
    </div>
  );
};
