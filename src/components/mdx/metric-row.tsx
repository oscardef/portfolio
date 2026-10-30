import { type ReactNode } from 'react';

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t-2 border-ink pt-3">
      <p className="tnum text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-2">{label}</p>
    </div>
  );
}

export function MetricRow({ children }: { children?: ReactNode }) {
  return <div className="not-prose my-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">{children}</div>;
}
