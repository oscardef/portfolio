'use client';

import { useEffect, useState } from 'react';
import type { Kind } from '@/lib/schemas';
import type { JourneyItem } from '@/lib/journey';
import { ProjectCard } from './cards';
import { cn } from '@/lib/utils';

const FILTERS: { kind: Kind | 'all'; label: string }[] = [
  { kind: 'all', label: 'All' },
  { kind: 'systems', label: 'Systems' },
  { kind: 'ml', label: 'Machine learning' },
  { kind: 'hardware', label: 'Hardware' },
  { kind: 'products', label: 'Products' },
];

const matches = (item: JourneyItem, kind: Kind | 'all') => kind === 'all' || item.kind === kind;

export function ProjectsBrowser({ items }: { items: JourneyItem[] }) {
  const [kind, setKind] = useState<Kind | 'all'>('all');

  // A link like /projects#ml opens with that filter on
  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.slice(1);
      if (FILTERS.some((f) => f.kind === hash)) setKind(hash as Kind);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  function choose(next: Kind | 'all') {
    setKind(next);
    history.replaceState(null, '', next === 'all' ? window.location.pathname : `#${next}`);
  }

  const shown = items.filter((item) => matches(item, kind));
  const available = FILTERS.filter((f) => f.kind === 'all' || items.some((i) => i.kind === f.kind));

  return (
    <>
      <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
        {available.map((f) => {
          const count = f.kind === 'all' ? items.length : items.filter((i) => i.kind === f.kind).length;
          return (
            <button
              key={f.kind}
              type="button"
              aria-pressed={kind === f.kind}
              onClick={() => choose(f.kind)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors',
                kind === f.kind
                  ? 'border-accent bg-accent text-white'
                  : 'border-border text-text-secondary hover:border-border-hover hover:text-text-primary'
              )}
            >
              {f.label}
              <span className={cn('tnum ml-1.5', kind === f.kind ? 'text-white/75' : 'text-text-muted')}>{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {shown.map((item, i) => (
          <li key={item.id}>
            <ProjectCard item={item} priority={i < 2} />
          </li>
        ))}
      </ul>
    </>
  );
}
