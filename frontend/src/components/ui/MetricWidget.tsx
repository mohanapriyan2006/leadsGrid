import { PanelCard } from "./PanelCard";

type MetricWidgetProps = {
  title: string;
  value: string;
  delta: string;
};

export const MetricWidget = ({ title, value, delta }: MetricWidgetProps) => {
  return (
    <PanelCard className="space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-text-dim">{title}</p>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="text-xs text-accent">{delta}</p>
    </PanelCard>
  );
};
