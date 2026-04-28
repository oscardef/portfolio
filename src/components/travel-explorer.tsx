'use client';

import { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Globe } from '@/components/globe';
import { travelData, getFlagEmoji, type ResolvedTravelEntry } from '@/data/travel';

const purposeLabels: Record<string, string> = {
  lived: 'Lived',
  travel: 'Travel',
  work: 'Work',
  conference: 'Conference',
  study: 'Study',
};

const purposeColors: Record<string, string> = {
  lived: 'bg-indigo-500/15 text-indigo-400',
  travel: 'bg-emerald-500/15 text-emerald-400',
  work: 'bg-amber-500/15 text-amber-400',
  conference: 'bg-cyan-500/15 text-cyan-400',
  study: 'bg-violet-500/15 text-violet-400',
};

interface PlaceGroup {
  entries: ResolvedTravelEntry[];
  place: string;
  country: string;
  countryCode: string;
}

interface CountryGroup {
  country: string;
  countryCode: string;
  places: PlaceGroup[];
}

export function TravelExplorer() {
  const [search, setSearch] = useState('');
  const [focusEntry, setFocusEntry] = useState<ResolvedTravelEntry | null>(null);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());

  const uniqueCountries = useMemo(
    () => [...new Set(travelData.map((t) => t.country))].length,
    []
  );
  const uniqueStates = useMemo(
    () => new Set(travelData.filter((t) => t.state).map((t) => t.state)).size,
    []
  );
  const uniquePlaces = useMemo(
    () => [...new Set(travelData.map((t) => t.place))].length,
    []
  );

  const filtered = useMemo(() => {
    if (!search) return travelData;
    const q = search.toLowerCase();
    return travelData.filter(
      (t) =>
        t.place.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q) ||
        (t.state && t.state.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q))
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, PlaceGroup>();
    for (const entry of filtered) {
      const key = `${entry.place}-${entry.country}`;
      if (!map.has(key)) {
        map.set(key, {
          entries: [],
          place: entry.place,
          country: entry.country,
          countryCode: entry.countryCode,
        });
      }
      map.get(key)!.entries.push(entry);
    }
    return [...map.values()].sort((a, b) => {
      const latestA = a.entries[a.entries.length - 1].startDate;
      const latestB = b.entries[b.entries.length - 1].startDate;
      return latestB.localeCompare(latestA);
    });
  }, [filtered]);

  const countryGroups = useMemo(() => {
    const map = new Map<string, CountryGroup>();
    for (const placeGroup of grouped) {
      const key = placeGroup.country;
      if (!map.has(key)) {
        map.set(key, {
          country: placeGroup.country,
          countryCode: placeGroup.countryCode,
          places: [],
        });
      }
      map.get(key)!.places.push(placeGroup);
    }
    return [...map.values()].sort((a, b) => a.country.localeCompare(b.country));
  }, [grouped]);

  const isSearching = search.length > 0;

  const toggleCountry = (country: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) {
        next.delete(country);
      } else {
        next.add(country);
      }
      return next;
    });
  };

  const isExpanded = (country: string) =>
    isSearching || expandedCountries.has(country);

  const globeMarkers = useMemo(() => {
    const seen = new Set<string>();
    return travelData
      .filter((t) => {
        const key = `${t.lat}-${t.lng}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((t) => ({
        lat: t.lat,
        lng: t.lng,
        size:
          focusEntry && focusEntry.place === t.place && focusEntry.country === t.country
            ? 0.14
            : t.purpose === 'lived' || t.purpose === 'study' || t.purpose === 'work'
              ? 0.08
              : 0.05,
      }));
  }, [focusEntry]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Globe */}
      <div className="relative">
        <div className="max-w-[400px] mx-auto lg:max-w-none">
          <Globe
            markers={globeMarkers}
            focusLng={focusEntry?.lng}
            focusLat={focusEntry?.lat}
          />
        </div>
        <div className="flex justify-center gap-6 mt-2 text-xs text-text-muted">
          <span>{uniqueCountries} countries</span>
          <span>·</span>
          <span>{uniquePlaces} places</span>
          {uniqueStates > 0 && (
            <>
              <span>·</span>
              <span>{uniqueStates} US states</span>
            </>
          )}
        </div>
      </div>

      {/* Search + List */}
      <div>
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search places, countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            aria-label="Search travel destinations"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
          {countryGroups.map((countryGroup) => {
            const expanded = isExpanded(countryGroup.country);
            const purposes = [...new Set(countryGroup.places.flatMap((p) => p.entries.map((e) => e.purpose)))];

            return (
              <div key={countryGroup.country}>
                {/* Country header */}
                <button
                  type="button"
                  onClick={() => toggleCountry(countryGroup.country)}
                  className="w-full text-left flex items-center gap-2.5 rounded-lg border border-border bg-bg-card px-3 py-2.5 transition-all hover:border-border-hover hover:bg-bg-card-hover"
                >
                  <span className="text-base leading-none">{getFlagEmoji(countryGroup.countryCode)}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-text-primary">{countryGroup.country}</span>
                    <span className="text-xs text-text-muted ml-2">
                      {countryGroup.places.length} {countryGroup.places.length === 1 ? 'place' : 'places'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {purposes.slice(0, 3).map((purpose) => (
                      <span key={purpose} className={`w-1.5 h-1.5 rounded-full ${purposeColors[purpose].split(' ')[0].replace('/15', '/60')}`} />
                    ))}
                    {expanded ? (
                      <ChevronDown size={14} className="text-text-muted ml-1" />
                    ) : (
                      <ChevronRight size={14} className="text-text-muted ml-1" />
                    )}
                  </div>
                </button>

                {/* Expanded places */}
                {expanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-3">
                    {countryGroup.places.map((group) => {
                      const isFocused = focusEntry && focusEntry.place === group.place && focusEntry.country === group.country;

                      return (
                        <button
                          key={`${group.place}-${group.country}`}
                          type="button"
                          onClick={() => {
                            if (isFocused) {
                              setFocusEntry(null);
                            } else {
                              setFocusEntry(group.entries[0]);
                            }
                          }}
                          className={`w-full text-left rounded-md px-3 py-2 transition-all ${
                            isFocused
                              ? 'bg-accent/[0.08] text-accent'
                              : 'hover:bg-bg-card-hover text-text-primary'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-sm truncate block">
                                {group.place}
                              </span>
                              {group.entries[0].state && (
                                <span className="text-[11px] text-text-muted">{group.entries[0].state}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {[...new Set(group.entries.map((e) => e.purpose))].map((purpose) => (
                                <span key={purpose} className={`px-1.5 py-0.5 rounded-full font-medium text-[10px] ${purposeColors[purpose]}`}>
                                  {purposeLabels[purpose]}
                                </span>
                              ))}
                              {group.entries.length > 1 && (
                                <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-bg-card text-text-muted">
                                  {group.entries.length}×
                                </span>
                              )}
                            </div>
                          </div>
                          {group.entries.some((e) => e.notes) && (
                            <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                              {group.entries.find((e) => e.notes)?.notes}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {countryGroups.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No places match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
