'use client';

import { useState, useMemo } from 'react';
import { Search, X, MapPin, Calendar } from 'lucide-react';
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

export function TravelExplorer() {
  const [search, setSearch] = useState('');
  const [focusEntry, setFocusEntry] = useState<ResolvedTravelEntry | null>(null);

  const uniqueCountries = useMemo(
    () => [...new Set(travelData.map((t) => t.country))].length,
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
        (t.notes && t.notes.toLowerCase().includes(q))
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, { entries: ResolvedTravelEntry[]; place: string; country: string; countryCode: string }>();
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

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {grouped.map((group) => (
            <button
              key={`${group.place}-${group.country}`}
              type="button"
              onClick={() => {
                // Toggle: deselect if clicking the same location
                if (focusEntry && focusEntry.place === group.place && focusEntry.country === group.country) {
                  setFocusEntry(null);
                } else {
                  setFocusEntry(group.entries[0]);
                }
              }}
              className={`w-full text-left rounded-lg border p-3 transition-all ${
                focusEntry && focusEntry.place === group.place && focusEntry.country === group.country
                  ? 'border-accent/50 bg-accent/[0.06]'
                  : 'border-border bg-bg-card hover:border-border-hover hover:bg-bg-card-hover'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none">{getFlagEmoji(group.countryCode)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {group.place}
                    </p>
                    <p className="text-xs text-text-muted">{group.country}</p>
                  </div>
                </div>
                {group.entries.length > 1 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted shrink-0">
                    {group.entries.length}×
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                {group.entries.map((entry, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded-full font-medium ${purposeColors[entry.purpose]}`}>
                      {purposeLabels[entry.purpose]}
                    </span>
                    <span className="text-text-muted flex items-center gap-1">
                      <Calendar size={10} />
                      {entry.startDate}
                      {entry.endDate ? ` – ${entry.endDate}` : ''}
                    </span>
                  </div>
                ))}
              </div>

              {group.entries.some((e) => e.notes) && (
                <p className="text-xs text-text-muted mt-1.5 line-clamp-1">
                  {group.entries.find((e) => e.notes)?.notes}
                </p>
              )}
            </button>
          ))}

          {grouped.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No places match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
