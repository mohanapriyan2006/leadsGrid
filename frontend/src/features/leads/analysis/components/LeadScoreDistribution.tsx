import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PanelCard } from "../../../../components/ui/PanelCard";
import type { ScoreBucket } from "../types/leadsAnalytics";

type LeadScoreDistributionProps = {
  data: ScoreBucket[];
};

export const LeadScoreDistribution = ({ data }: LeadScoreDistributionProps) => {
  const COLORS = ["var(--danger)", "var(--warning)", "var(--success)"];

  return (
    <PanelCard className="space-y-3">
      <header>
        <h3 className="text-lg font-semibold text-content">Lead Score Distribution</h3>
        <p className="text-xs text-content-secondary">Donut view of low, medium, and high quality segments.</p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, _name, entry) => [value, entry?.payload?.range ?? "Segment"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(15,20,32,0.95)",
                color: "#e8ecff",
              }}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="range"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.range} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
