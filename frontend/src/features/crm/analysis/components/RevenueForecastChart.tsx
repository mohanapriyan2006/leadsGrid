import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PanelCard } from "../../../../components/ui/PanelCard";
import type { TrendPoint } from "../types/analytics";

type RevenueForecastChartProps = {
  data: TrendPoint[];
};

export const RevenueForecastChart = ({ data }: RevenueForecastChartProps) => {
  const withTrend = data.map((point, index, arr) => {
    const start = Math.max(0, index - 2);
    const window = arr.slice(start, index + 1);
    const avg = window.reduce((sum, item) => sum + item.value, 0) / Math.max(1, window.length);
    return { ...point, movingAvg: Math.round(avg) };
  });

  return (
    <PanelCard className="space-y-3">
      <header>
        <h3 className="text-lg font-semibold text-content">Revenue Trend</h3>
        <p className="text-xs text-content-secondary">Composed view of revenue and rolling forecast signal.</p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={withTrend}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="date" stroke="var(--content-secondary)" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <YAxis stroke="var(--content-secondary)" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "movingAvg") {
                  return [`$${Number(value).toLocaleString()}`, "Moving avg"];
                }
                return [`$${Number(value).toLocaleString()}`, "Revenue"];
              }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(15,20,32,0.95)",
                color: "#e8ecff",
              }}
            />
            <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} opacity={0.75} />
            <Line type="monotone" dataKey="movingAvg" stroke="var(--success)" strokeWidth={2.2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
