'use client';

import dynamic from 'next/dynamic';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { GlobeData, GlobePlace } from '@/lib/globe-data';
import { cn } from '@/lib/utils';

const Globe = dynamic(() => import('./globe/globe').then((m) => m.Globe), { ssr: false });

function normalise(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

interface CountryGroup {
  country: string;
  places: GlobePlace[];
  centre: { lng: number; lat: number };
  home: boolean;
}

export function PlacesSection({ globe }: { globe: GlobeData }) {
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState<{ lng: number; lat: number } | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [near, setNear] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inputId = useId();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      rootMargin: '100% 0px',
    });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Countries with the most places first
  const groups = useMemo<CountryGroup[]>(() => {
    const byCountry = new Map<string, GlobePlace[]>();
    for (const p of globe.places) byCountry.set(p.country, [...(byCountry.get(p.country) ?? []), p]);
    return [...byCountry.entries()]
      .map(([country, places]) => ({
        country,
        places: places.sort((a, b) => a.place.localeCompare(b.place)),
        centre: {
          lng: places.reduce((s, p) => s + p.lng, 0) / places.length,
          lat: places.reduce((s, p) => s + p.lat, 0) / places.length,
        },
        home: places.some((p) => p.hue !== null),
      }))
      .sort((a, b) => b.places.length - a.places.length || a.country.localeCompare(b.country));
  }, [globe.places]);

  const q = normalise(query.trim());
  const visible = groups
    .map((g) => ({
      ...g,
      places: g.places.filter((p) => !q || normalise(`${p.place} ${p.country}`).includes(q)),
    }))
    .filter((g) => g.places.length > 0);
  const matches = visible.reduce((n, g) => n + g.places.length, 0);

  function choose(group: CountryGroup) {
    setChosen(group.country);
    setFocus({ ...group.centre });
  }

  return (
    <section id="places" ref={sectionRef} aria-labelledby="places-title" className="py-24 md:py-32">
      <div className="container-page">
        <h2 id="places-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Places I’ve been
        </h2>
        <p className="mt-4 max-w-[56ch] text-lg text-text-secondary">
          {globe.places.length} places in {groups.length} countries. I like going somewhere as different as
          possible from anywhere I’ve been before. Drag the globe, or pick a country to fly there.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <div className="relative aspect-square w-full lg:sticky lg:top-24 lg:self-start">
            {near && <Globe data={globe} mode="travel" focus={focus} className="absolute inset-0" />}
          </div>

          <div>
            <div className="relative">
              <label htmlFor={inputId} className="sr-only">
                Find a place
              </label>
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                id={inputId}
                type="search"
                name="place"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a city or country"
                className="w-full rounded-full border border-border bg-bg-card py-2.5 pl-10 pr-4 text-[0.9375rem] placeholder:text-text-muted focus-visible:border-border-hover"
              />
            </div>
            <p className="mt-3 h-5 text-sm text-text-muted" aria-live="polite">
              {q ? `${matches} ${matches === 1 ? 'match' : 'matches'}` : ''}
            </p>

            {visible.length > 0 ? (
              <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
                {visible.map((g) => (
                  <li key={g.country} className="border-t border-border py-3">
                    <button
                      type="button"
                      onClick={() => choose(g)}
                      aria-pressed={chosen === g.country}
                      className={cn(
                        'flex w-full items-baseline justify-between gap-3 text-left font-semibold transition-colors hover:text-accent-light',
                        chosen === g.country && 'text-accent-light'
                      )}
                    >
                      <span>
                        {g.country}
                        {g.home && (
                          <span className="ml-2 align-middle text-xs font-normal text-text-muted">lived</span>
                        )}
                      </span>
                      <span className="tnum text-xs font-normal text-text-muted">{g.places.length}</span>
                    </button>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-text-secondary">
                      {g.places.map((p) => p.place).join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-text-secondary">No places match “{query}”. Try a country name instead.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
