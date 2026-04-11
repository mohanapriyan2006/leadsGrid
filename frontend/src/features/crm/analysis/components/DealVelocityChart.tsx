import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PanelCard } from "../../../../components/ui/PanelCard";
import type { VelocityPoint } from "../types/analytics";

type DealVelocityChartProps = {
  data: VelocityPoint[];
};

export const DealVelocityChart = ({ data }: DealVelocityChartProps) => {
  return (
    <PanelCard className="space-y-3">
      <header>
        <h3 className="text-lg font-semibold text-content">Deal Velocity</h3>
        <p className="text-xs text-content-secondary">Average days spent in each pipeline stage.</p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="stage" stroke="var(--content-secondary)" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <YAxis stroke="var(--content-secondary)" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value} days`, "Avg duration"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(15,20,32,0.95)",
                color: "#e8ecff",
              }}
            />
            <Bar dataKey="avgDays" fill="var(--warning)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
