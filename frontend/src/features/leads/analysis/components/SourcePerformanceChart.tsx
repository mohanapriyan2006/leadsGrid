import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

import { PanelCard } from "../../../../components/ui/PanelCard";
import type { SourcePerformance } from "../types/leadsAnalytics";

type SourcePerformanceChartProps = {
  data: SourcePerformance[];
};

export const SourcePerformanceChart = ({ data }: SourcePerformanceChartProps) => {
  return (
    <PanelCard className="space-y-3">
      <header>
        <h3 className="text-lg font-semibold text-content">Source Performance</h3>
        <p className="text-xs text-content-secondary">Radar view of high-intent quality by source channel.</p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
            <PolarAngleAxis dataKey="source" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "highIntentRate") return [`${value}%`, "High intent rate"];
                return [value, name === "highIntent" ? "High intent" : "Total"];
              }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(15,20,32,0.95)",
                color: "#e8ecff",
              }}
            />
            <Radar
              name="High intent rate"
              dataKey="highIntentRate"
              stroke="var(--success)"
              fill="var(--success)"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-content-tertiary">
        Tip: prioritize channels where high-intent grows while total volume stays stable.
      </p>
    </PanelCard>
  );
};
