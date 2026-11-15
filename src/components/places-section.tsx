'use client';

import dynamic from 'next/dynamic';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Minimize2, Search } from 'lucide-react';
import type { GlobeData, GlobePlace } from '@/lib/globe-data';
import { cn } from '@/lib/utils';

const Globe = dynamic(() => import('./globe/globe').then((m) => m.Globe), { ssr: false });

function normalise(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

// How many countries a phone lists before "Show all"
const PHONE_COUNTRIES = 8;

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const inWords = (n: number) => WORDS[n] ?? String(n);

// What the globe's colours mean; the swatches use the globe's own colours
const LEGEND = [
  { label: 'Lived', more: '', swatch: 'bg-[var(--globe-lived)]' },
  { label: 'Visited', more: '', swatch: 'bg-[var(--globe-visited)]' },
  // "visited" is dropped on phones so the legend stays on one line
  { label: 'US states', more: ' visited', swatch: 'bg-[var(--globe-state)] ring-1 ring-inset ring-[var(--globe-state-border)]' },
];

interface CountryGroup {
  country: string;
  places: GlobePlace[];
  home: boolean;
}

export function PlacesSection({ globe }: { globe: GlobeData }) {
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  // Phones start with the countries with the most places; the rest unfold on request
  const [showAll, setShowAll] = useState(false);
  // The chosen country's frame: the globe flies there and outlines the country
  const frame = chosen ? (globe.frames[chosen] ?? null) : null;
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
        home: places.some((p) => p.home),
      }))
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
  // A search always shows everything it finds
  const collapsed = !showAll && !q;

  // Choosing the country already chosen lets go of it
  const choose = (group: CountryGroup) => setChosen(chosen === group.country ? null : group.country);
  const zoomOut = () => setChosen(null);

  return (
    <section id="places" ref={sectionRef} aria-labelledby="places-title" className="section">
      <div className="container-page">
        <h2 id="places-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Places I’ve been
        </h2>
        <p className="mt-4 max-w-[56ch] text-lg text-text-secondary">
          {globe.places.length} places in {groups.length} countries so far, the ones I’ve lived in included
          {globe.states.length > 0 && `, and ${inWords(globe.states.length)} US states`}. Drag the globe, or
          pick a country to fly there.
        </p>

        <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          {/* The globe stays in view while the list scrolls, on phones too, so a
              country chosen from the list can be seen being flown to */}
          <div className="sticky top-16 z-20 -mx-[var(--gutter)] bg-bg px-[var(--gutter)] pb-2 lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:px-0 lg:pb-0">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-full h-5 bg-gradient-to-b from-bg to-transparent lg:hidden"
            />
            <div className="relative h-[38vh] w-full lg:aspect-square lg:h-auto lg:max-h-[calc(100vh-11rem)]">
              {/* A faint disc marks where the globe appears while its code loads */}
              {!near && (
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 aspect-square h-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-bg-card/40"
                />
              )}
              {near && (
                <Globe data={globe} mode="travel" focus={frame} highlight={frame?.id ?? null} className="absolute inset-0" />
              )}
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
            <ul
              className="mt-1 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-xs text-text-muted sm:gap-x-5 sm:text-sm lg:mt-2"
              aria-label="What the colours mean"
            >
              {LEGEND.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5 sm:gap-2">
                  <span aria-hidden="true" className={cn('h-3 w-4 rounded-[4px]', item.swatch)} />
                  <span>
                    {item.label}
                    {item.more && <span className="hidden sm:inline">{item.more}</span>}
                  </span>
                </li>
              ))}
              <li className="flex items-center gap-1.5 sm:gap-2">
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
                {visible.map((g, i) => (
                  <li
                    key={g.country}
                    className={cn('border-t border-border py-3', collapsed && i >= PHONE_COUNTRIES && 'hidden sm:block')}
                  >
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
            {collapsed && visible.length > PHONE_COUNTRIES && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-bg-card py-3 text-[0.9375rem] font-medium transition-colors hover:border-border-hover hover:bg-bg-card-hover sm:hidden"
              >
                Show all {visible.length} countries
                <ChevronDown size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
