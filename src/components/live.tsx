'use client';

import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

// Depends on the visitor's clock, so it renders empty on the server and fills
// in once the page is live; there is nothing to mismatch.
const never = () => () => {};
const nothing = () => null;

const WEEK = 7 * 24 * 60 * 60 * 1000;

// A thin bar showing how much of the period from `from` to `to` (ISO dates)
// has passed, and which week of it this is ("Week 7 of 26")
export function Progress({
  from,
  to,
  className,
}: {
  from: string;
  to: string;
  className?: string;
}) {
  const at = useSyncExternalStore(never, () => Date.now(), nothing);
  const [start, end] = [Date.parse(from), Date.parse(to)];
  const weeks = Math.round((end - start) / WEEK);
  const share = at === null ? 0 : Math.min(1, Math.max(0, (at - start) / (end - start)));
  const week =
    at === null ? null : Math.min(weeks, Math.max(1, Math.floor((at - start) / WEEK) + 1));
  const text =
    at === null
      ? ''
      : at >= end
        ? 'Finished'
        : at < start
          ? 'Not started'
          : `Week ${week} of ${weeks}`;
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <span
        role="img"
        aria-label={text || 'Progress'}
        className="block h-1 w-full max-w-[15rem] overflow-hidden rounded-full bg-border"
      >
        <span
          className="block h-full rounded-full bg-accent-light transition-[width] duration-700 ease-out"
          style={{ width: `${Math.round(share * 100)}%` }}
        />
      </span>
      <span aria-hidden="true" className="tnum shrink-0 text-xs text-text-muted">
        {text}
      </span>
    </span>
  );
}
