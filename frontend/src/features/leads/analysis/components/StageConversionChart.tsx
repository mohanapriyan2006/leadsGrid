import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PanelCard } from "../../../../components/ui/PanelCard";
import type { StageConversionPoint } from "../types/leadsAnalytics";

type StageConversionChartProps = {
  data: StageConversionPoint[];
};

export const StageConversionChart = ({ data }: StageConversionChartProps) => {
  return (
    <PanelCard className="space-y-3">
      <header>
        <h3 className="text-lg font-semibold text-content">Stage Conversion Trend</h3>
        <p className="text-xs text-content-secondary">Compare lead volume and drop-off rate across board stages.</p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="stage" stroke="var(--content-secondary)" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <YAxis
              yAxisId="count"
              stroke="var(--content-secondary)"
              tick={{ fill: "var(--content-secondary)", fontSize: 12 }}
            />
            <YAxis
              yAxisId="dropoff"
              orientation="right"
              domain={[0, 100]}
              stroke="var(--content-secondary)"
              tick={{ fill: "var(--content-secondary)", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "dropOffRate") return [`${value}%`, "Drop-off"];
                return [value, "Leads"];
              }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(15,20,32,0.95)",
                color: "#e8ecff",
              }}
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="count"
              stroke="var(--info)"
              strokeWidth={2.4}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="dropoff"
              type="monotone"
              dataKey="dropOffRate"
              stroke="var(--danger)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
