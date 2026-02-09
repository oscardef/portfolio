interface Metric {
  label: string;
  value: string;
}

interface MetricRowProps {
  metrics: Metric[];
}

export function MetricRow({ metrics }: MetricRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-bg-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-accent">{metric.value}</p>
          <p className="text-xs text-text-muted mt-1">{metric.label}</p>
        </div>
      ))}
    </div>
  );
}
