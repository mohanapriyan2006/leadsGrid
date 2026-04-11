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
import type { StageCountPoint } from "../types/analytics";

type PipelineChartProps = {
  data: StageCountPoint[];
};

export const PipelineChart = ({ data }: PipelineChartProps) => {
  return (
    <PanelCard className="space-y-3">
      <header>
        <h3 className="text-lg font-semibold text-content">Pipeline Distribution</h3>
        <p className="text-xs text-content-secondary">Deals per stage and weighted value density.</p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="label" stroke="var(--content-secondary)" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <YAxis stroke="var(--content-secondary)" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(15,20,32,0.95)",
                color: "#e8ecff",
              }}
            />
            <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
