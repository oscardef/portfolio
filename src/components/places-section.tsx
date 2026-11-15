'use client';

import dynamic from 'next/dynamic';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Minimize2, Search } from 'lucide-react';
import type { GlobeData, GlobePlace } from '@/lib/globe-data';
import { cn } from '@/lib/utils';

const Globe = dynamic(() => import('./globe/globe').then((m) => m.Globe), { ssr: false });

function normalise(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const inWords = (n: number) => WORDS[n] ?? String(n);

// What the globe's colours mean; the swatches use the globe's own colours
const LEGEND = [
  { label: 'Lived', swatch: 'bg-[var(--globe-lived)]' },
  { label: 'Visited', swatch: 'bg-[var(--globe-visited)]' },
  { label: 'US states visited', swatch: 'bg-[var(--globe-state)] ring-1 ring-inset ring-[var(--globe-state-border)]' },
];

interface CountryGroup {
  country: string;
  places: GlobePlace[];
  // Where to fly when the country is chosen: its places' centre, closer for compact countries
  view: { lng: number; lat: number; zoom: number };
  home: boolean;
}

export function PlacesSection({ globe }: { globe: GlobeData }) {
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState<CountryGroup['view'] | null>(null);
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
      .map(([country, places]) => {
        const lng = places.reduce((s, p) => s + p.lng, 0) / places.length;
        const lat = places.reduce((s, p) => s + p.lat, 0) / places.length;
        // Spread of the places in degrees, from the centre
        const spread = Math.max(1, ...places.map((p) => Math.hypot((p.lng - lng) * Math.cos((lat * Math.PI) / 180), p.lat - lat)));
        return {
          country,
          places: places.sort((a, b) => a.place.localeCompare(b.place)),
          view: { lng, lat, zoom: Math.min(6, Math.max(1.8, 22 / spread)) },
          home: places.some((p) => p.home),
        };
      })
      .sort((a, b) => b.places.length - a.places.length || a.country.localeCompare(b.country));
  }, [globe.places]);

  const q = normalise(query.trim());
  const visible = groups
    .map((g) => ({
      ...g,
      places: g.places.filter((p) => !q || normalise(`${p.place} ${p.state ?? ''} ${p.country}`).includes(q)),
    }))
    .filter((g) => g.places.length > 0);
  const matches = visible.reduce((n, g) => n + g.places.length, 0);

  function choose(group: CountryGroup) {
    if (chosen === group.country) return zoomOut();
    setChosen(group.country);
    setFocus({ ...group.view });
  }

  function zoomOut() {
    setChosen(null);
    setFocus(null);
  }

  return (
    <section id="places" ref={sectionRef} aria-labelledby="places-title" className="py-24 md:py-32">
      <div className="container-page">
        <h2 id="places-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Places I’ve been
        </h2>
        <p className="mt-4 max-w-[56ch] text-lg text-text-secondary">
          {globe.places.length} places in {groups.length} countries so far, the ones I’ve lived in included
          {globe.states.length > 0 && `, and ${inWords(globe.states.length)} US states`}. Drag the globe, or
          pick a country to fly there.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-square w-full lg:max-h-[calc(100vh-11rem)]">
              {near && <Globe data={globe} mode="travel" focus={focus} className="absolute inset-0" />}
              {chosen && (
                <button
                  type="button"
                  onClick={zoomOut}
                  className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-bg/85 px-3.5 py-1.5 text-sm text-text-secondary backdrop-blur transition-colors hover:border-border-hover hover:text-text-primary"
                >
                  <Minimize2 size={14} aria-hidden="true" />
                  Whole world
                </button>
              )}
            </div>
            <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-muted" aria-label="What the colours mean">
              {LEGEND.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span aria-hidden="true" className={cn('h-3 w-4 rounded-[4px]', item.swatch)} />
                  {item.label}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--globe-place)]" />
                Places
              </li>
            </ul>
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
                placeholder="Find a city, country or US state"
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
                          <span className="ml-2 rounded-full bg-[var(--lived-muted)] px-2 py-0.5 align-middle text-xs font-medium text-[var(--lived)]">
                            lived
                          </span>
                        )}
                      </span>
                      <span className="tnum text-xs font-normal text-text-muted">{g.places.length}</span>
                    </button>
                    {g.places.some((p) => p.state) ? (
                      // US places, a line per state
                      <ul className="mt-1 space-y-0.5 text-[0.9375rem] leading-relaxed text-text-secondary">
                        {[...new Set(g.places.map((p) => p.state ?? ''))].sort().map((state) => (
                          <li key={state}>
                            {state && <span className="font-medium text-text-primary">{state}: </span>}
                            {g.places
                              .filter((p) => (p.state ?? '') === state)
                              .map((p) => p.place)
                              .join(', ')}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-[0.9375rem] leading-relaxed text-text-secondary">
                        {g.places.map((p) => p.place).join(', ')}
                      </p>
                    )}
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
