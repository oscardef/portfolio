'use client';

import { useId, useMemo, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export interface Place {
  key: string;
  place: string;
  country: string;
  x: number;
  y: number;
  // Route hue for places lived or worked in; null for trips
  hue: number | null;
}

interface PlacesExplorerProps {
  places: Place[];
  map: { width: number; height: number; land: string; graticule: string };
}

function normalise(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function PlacesExplorer({ places, map }: PlacesExplorerProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const inputId = useId();

  const q = normalise(query.trim());
  const matches = useMemo(
    () => new Set(places.filter((p) => !q || normalise(`${p.place} ${p.country}`).includes(q)).map((p) => p.key)),
    [places, q]
  );

  // Countries with the most places first
  const byCountry = useMemo(() => {
    const groups = new Map<string, Place[]>();
    for (const p of places) groups.set(p.country, [...(groups.get(p.country) ?? []), p]);
    return [...groups.entries()]
      .map(([country, list]) => ({ country, list: list.sort((a, b) => a.place.localeCompare(b.place)) }))
      .sort((a, b) => b.list.length - a.list.length || a.country.localeCompare(b.country));
  }, [places]);

  const countries = byCountry.length;
  const activePlace = places.find((p) => p.key === active);
  const visibleGroups = byCountry
    .map((g) => ({ ...g, list: g.list.filter((p) => matches.has(p.key)) }))
    .filter((g) => g.list.length > 0);

  return (
    <>
      <p className="mt-4 max-w-[56ch] text-ink-2">
        {places.length} places in {countries} countries. Coloured dots are places I’ve lived or worked;
        the rest are trips.
      </p>

      <div className="relative mt-10" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${map.width} ${map.height}`} className="block h-auto w-full" aria-hidden="true" focusable="false">
          <path className="map-graticule" d={map.graticule} />
          <path className="map-land" d={map.land} />
        </svg>
        {places.map((p) => {
          const on = matches.has(p.key);
          return (
            <span
              key={p.key}
              aria-hidden="true"
              onMouseEnter={() => setActive(p.key)}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-[opacity,scale] duration-200',
                p.hue === null ? 'size-2 bg-ink/80' : 'hue-bg size-3',
                !on && 'opacity-15',
                active === p.key && 'scale-[1.8]'
              )}
              style={{ left: `${p.x}%`, top: `${p.y}%`, '--h': p.hue ?? 0, boxShadow: '0 0 0 1.5px var(--paper)' } as CSSProperties}
            />
          );
        })}
        {activePlace && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+0.75rem)] whitespace-nowrap rounded-[3px] bg-ink px-2 py-1 text-sm text-paper"
            style={{ left: `${activePlace.x}%`, top: `${activePlace.y}%` }}
          >
            {activePlace.place}, {activePlace.country}
          </span>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label htmlFor={inputId} className="text-sm text-ink-2">
          Find a place
        </label>
        <input
          id={inputId}
          type="search"
          name="place"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="City or country"
          className="w-full max-w-xs rounded-full border border-rule bg-paper-raised px-4 py-2 text-[0.9375rem] placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-ink"
        />
        <p className="text-sm text-ink-2" aria-live="polite">
          {q ? `${matches.size} ${matches.size === 1 ? 'match' : 'matches'}` : ''}
        </p>
      </div>

      {visibleGroups.length > 0 ? (
        <dl className="mt-8 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
          {visibleGroups.map((g) => (
            <div key={g.country} className="mb-5 break-inside-avoid">
              <dt className="font-semibold">{g.country}</dt>
              <dd className="mt-0.5 text-[0.9375rem] leading-relaxed text-ink-2">
                {g.list.map((p, i) => (
                  <span key={p.key}>
                    <span
                      onMouseEnter={() => setActive(p.key)}
                      onMouseLeave={() => setActive(null)}
                      className={cn('cursor-default', active === p.key && 'text-ink underline underline-offset-4')}
                    >
                      {p.place}
                    </span>
                    {i < g.list.length - 1 && ', '}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-8 text-ink-2">No places match “{query}”. Try a country name instead.</p>
      )}
    </>
  );
}
