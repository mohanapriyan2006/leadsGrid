import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { PanelCard } from "../../../../components/ui/PanelCard";
import type { FunnelPoint } from "../types/analytics";

type ConversionFunnelProps = {
  data: FunnelPoint[];
};

export const ConversionFunnel = ({ data }: ConversionFunnelProps) => {
  const radialData = data.map((entry) => ({
    stage: entry.label,
    conversion: Number(entry.conversionFromPrevious.toFixed(1)),
  }));

  return (
    <PanelCard className="space-y-3">
      <header>
        <h3 className="text-lg font-semibold text-content">Conversion Funnel</h3>
        <p className="text-xs text-content-secondary">Radial view of conversion efficiency across CRM stages.</p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart data={radialData} innerRadius="20%" outerRadius="90%" startAngle={180} endAngle={-180}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <Tooltip
              formatter={(value) => [`${value}%`, "Conversion"]}
              labelFormatter={(_value, payload) => payload?.[0]?.payload?.stage ?? "Stage"}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(15,20,32,0.95)",
                color: "#e8ecff",
              }}
            />
            <RadialBar
              dataKey="conversion"
              background={{ fill: "rgba(255,255,255,0.08)" }}
              cornerRadius={10}
              fill="var(--info)"
              label={{ position: "insideStart", fill: "#d7def8", fontSize: 11 }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
