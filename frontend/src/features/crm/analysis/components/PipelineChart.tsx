import {
  ResponsiveContainer,
  Tooltip,
  Treemap,
} from "recharts";

import { PanelCard } from "../../../../components/ui/PanelCard";
import type { StageCountPoint } from "../types/analytics";

type PipelineChartProps = {
  data: StageCountPoint[];
};

const TREE_COLORS = ["var(--info)", "var(--accent)", "var(--warning)", "var(--success)"];

export const PipelineChart = ({ data }: PipelineChartProps) => {
  const treeData = data.map((item, index) => ({
    name: item.label,
    size: item.count || 0.1,
    fill: TREE_COLORS[index % TREE_COLORS.length],
  }));

  return (
    <PanelCard className="space-y-3">
      <header>
        <h3 className="text-lg font-semibold text-content">Pipeline Distribution</h3>
        <p className="text-xs text-content-secondary">Treemap view of stage concentration by deal volume.</p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={treeData} dataKey="size" stroke="rgba(255,255,255,0.2)" fill="var(--accent)">
            <Tooltip
              formatter={(value, _name, entry) => [value, entry?.payload?.name ?? "Stage"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(167,139,250,0.25)",
                background: "rgba(15,20,32,0.95)",
                color: "#e8ecff",
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
