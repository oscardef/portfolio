import { type ReactNode } from 'react';

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card px-4 py-5 text-center">
      <p className="text-2xl font-bold text-accent tracking-tight">{value}</p>
      <p className="text-xs text-text-muted mt-1.5">{label}</p>
    </div>
  );
}

export function MetricRow({ children }: { children?: ReactNode }) {
  return (
    <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
      {children}
    </div>
  );
}
