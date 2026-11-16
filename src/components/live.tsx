'use client';

import { useSyncExternalStore } from 'react';

// Depends on the visitor's clock, so it renders empty on the server and fills
// in once the page is live; there is nothing to mismatch.
const never = () => () => {};
const nothing = () => null;

// A thin bar showing how much of the period from `from` to `to` (ISO dates) has passed
export function Progress({
  from,
  to,
  className,
}: {
  from: string;
  to: string;
  className?: string;
}) {
  const share = useSyncExternalStore(
    never,
    () => {
      const [start, end] = [Date.parse(from), Date.parse(to)];
      return Math.round(Math.min(1, Math.max(0, (Date.now() - start) / (end - start))) * 100);
    },
    nothing
  );
  return (
    <span
      role="img"
      aria-label={share === null ? 'Progress' : `About ${share}% of the way through`}
      title={share === null ? undefined : `About ${share}% of the way through`}
      className={className}
    >
      <span
        className="block h-full rounded-full bg-accent-light transition-[width] duration-700 ease-out"
        style={{ width: `${share ?? 0}%` }}
      />
    </span>
  );
}
