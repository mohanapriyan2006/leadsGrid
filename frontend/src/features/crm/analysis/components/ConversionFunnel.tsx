import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PanelCard } from "../../../../components/ui/PanelCard";
import type { FunnelPoint } from "../types/analytics";

type ConversionFunnelProps = {
  data: FunnelPoint[];
};

export const ConversionFunnel = ({ data }: ConversionFunnelProps) => {
  return (
    <PanelCard className="space-y-3">
      <header>
        <h3 className="text-lg font-semibold text-content">Conversion Funnel</h3>
        <p className="text-xs text-content-secondary">Lead flow progression across CRM stages.</p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="label" stroke="var(--content-secondary)" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <YAxis stroke="var(--content-secondary)" tick={{ fill: "var(--content-secondary)", fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "conversionFromPrevious") {
                  return [`${value}%`, "Conversion"];
                }
                return [value, "Deals"];
              }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(15,20,32,0.95)",
                color: "#e8ecff",
              }}
            />
            <Bar dataKey="value" fill="var(--info)" radius={[8, 8, 0, 0]}>
              <LabelList
                dataKey="conversionFromPrevious"
                position="top"
                formatter={(value) => `${value ?? 0}%`}
                fill="var(--content-secondary)"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
