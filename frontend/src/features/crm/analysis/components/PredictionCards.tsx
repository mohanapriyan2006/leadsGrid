import type { Prediction } from "../types/analytics";

type PredictionCardsProps = {
  prediction: Prediction;
};

const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export const PredictionCards = ({ prediction }: PredictionCardsProps) => {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article className="glass-card-sm p-4">
        <p className="text-xs uppercase tracking-[0.18em]  ">Expected Revenue</p>
        <p className="mt-2 text-2xl font-semibold text-content">{formatCurrency(prediction.expectedRevenue)}</p>
        <p className="mt-1 text-xs text-success">Next 30 days projection</p>
      </article>

      <article className="glass-card-sm p-4">
        <p className="text-xs uppercase tracking-[0.18em]  ">Likely to Close</p>
        <p className="mt-2 text-2xl font-semibold text-content">{prediction.closingDeals.length}</p>
        <p className="mt-1 text-xs text-info">High confidence candidates</p>
      </article>

      <article className="glass-card-sm p-4">
        <p className="text-xs uppercase tracking-[0.18em]  ">Deals at Risk</p>
        <p className="mt-2 text-2xl font-semibold text-content">{prediction.atRiskDeals.length}</p>
        <p className="mt-1 text-xs text-danger">Require intervention sprint</p>
      </article>

      <article className="glass-card-sm p-4">
        <p className="text-xs uppercase tracking-[0.18em]  ">Confidence Score</p>
        <p className="mt-2 text-2xl font-semibold text-content">{prediction.confidenceScore}%</p>
        <p className="mt-1 text-xs text-accent">Best conversion: {prediction.bestStageConversion}</p>
      </article>
    </section>
  );
};
