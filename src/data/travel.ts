/**
 * ✈️  Travel Data
 *
 * Add places you've visited, lived, or worked in.
 * Each entry appears as a marker on the 3D globe and in the searchable list.
 *
 * HOW TO ADD A NEW PLACE:
 *   1. Add an entry below with `place`, `country`, `startDate`, `purpose`
 *   2. Run:  npx tsx scripts/geocode.ts
 *      This auto-fetches lat/lng/country-code from OpenStreetMap (free, no key)
 *      and caches the result in src/data/geocode-cache.json
 *   3. Commit both files. Done!
 *
 *   Examples:
 *   { place: 'Santorini', country: 'Greece', startDate: '2025-06-14', endDate: '2025-06-18', purpose: 'travel' },
 *   { place: 'Kyoto', country: 'Japan', startDate: '2025-03-20', purpose: 'travel', notes: 'Cherry blossom season' },
 *
 * DATE FORMATS:  'YYYY'  |  'YYYY-MM'  |  'YYYY-MM-DD'
 * PURPOSE:       'lived' | 'travel' | 'work' | 'conference' | 'study'
 *
 * ─────────────────────────────────────────────────────────────────────
 * BULK IMPORT FROM PHOTOS (extract GPS locations from your camera roll):
 *
 *   • Google Takeout → export Google Photos → each JSON sidecar has lat/lng
 *   • ExifTool CLI:  `exiftool -csv -gpslatitude -gpslongitude -createdate *.jpg > trips.csv`
 *   • Photo Exif Editor (iOS) — browse & export EXIF GPS data
 *   • Geotag Photos Pro (iOS/Android) — map view + CSV/GPX export
 *   • Immich (self-hosted) — open-source photo manager with a map/places view
 *
 *   Once you have a CSV with place names + dates, convert rows into entries below,
 *   then run `npx tsx scripts/geocode.ts` to resolve coordinates.
 * ─────────────────────────────────────────────────────────────────────
 */

import geocodeCache from './geocode-cache.json';

// ── User-facing type: only the fields you fill in ──────────────────
export interface TravelEntry {
  /** City, town, island, region — whatever you want to call the place */
  place: string;
  /** Country name */
  country: string;
  /** 'YYYY', 'YYYY-MM', or 'YYYY-MM-DD' */
  startDate: string;
  /** Omit for one-off trips or ongoing stays */
  endDate?: string;
  purpose: 'lived' | 'travel' | 'work' | 'conference' | 'study';
  /** Short note (optional) */
  notes?: string;
}

// ── Resolved entry with coordinates (looked up from cache) ─────────
export interface ResolvedTravelEntry extends TravelEntry {
  lat: number;
  lng: number;
  countryCode: string;
}

// ── Coordinate resolver (reads from geocode-cache.json) ────────────
const CACHE = geocodeCache as Record<string, { lat: number; lng: number; cc: string }>;

function resolveEntry(entry: TravelEntry): ResolvedTravelEntry {
  const key = `${entry.place}, ${entry.country}`;
  const coords = CACHE[key];
  if (!coords) {
    console.warn(
      `[travel] No coordinates for "${key}". Run: npx tsx scripts/geocode.ts`
    );
    return { ...entry, lat: 0, lng: 0, countryCode: '??' };
  }
  return { ...entry, lat: coords.lat, lng: coords.lng, countryCode: coords.cc };
}

// Helper to get flag emoji from country code
export function getFlagEmoji(countryCode: string): string {
  if (countryCode === '??') return '🏳️';
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

// ── YOUR TRAVEL DATA ───────────────────────────────────────────────
// Just fill in place, country, dates, purpose, and an optional note.
// Coordinates are resolved automatically from the COORDS table above.

const rawTravelData: TravelEntry[] = [
  // ── Places Lived ──
  { place: 'Bangkok',    country: 'Thailand',       startDate: '2003',    endDate: '2006',    purpose: 'lived', notes: 'Born here' },
  { place: 'Stockholm',  country: 'Sweden',          startDate: '2006',    endDate: '2007',    purpose: 'lived' },
  { place: 'Al Ain',     country: 'UAE',              startDate: '2007',    endDate: '2010',    purpose: 'lived' },
  { place: 'Egham',      country: 'United Kingdom',   startDate: '2010',    endDate: '2012',    purpose: 'lived' },
  { place: 'Dubai',      country: 'UAE',              startDate: '2012',    endDate: '2018',    purpose: 'lived' },
  { place: 'Stockholm',  country: 'Sweden',          startDate: '2018',    endDate: '2021',    purpose: 'study', notes: 'IB Diploma at ISSR' },
  { place: 'Groningen',  country: 'Netherlands',     startDate: '2021',    endDate: '2024',    purpose: 'study', notes: 'BSc Computing Science' },
  { place: 'Lausanne',   country: 'Switzerland',     startDate: '2024',    endDate: '2026',    purpose: 'study', notes: 'MSc Computer Science at EPFL' },
  { place: 'London',     country: 'United Kingdom',   startDate: '2026',                        purpose: 'work',  notes: 'Bloomberg SWE' },

  // ── Work ──
  { place: 'Veldhoven',  country: 'Netherlands',     startDate: '2023-02', endDate: '2023-09', purpose: 'work',  notes: 'ASML internship' },
  { place: 'Abu Dhabi',  country: 'UAE',              startDate: '2022-07', endDate: '2022-08', purpose: 'work',  notes: 'Securrency internship' },

  // ── Travel — add trips here! ──
  // { place: 'Santorini', country: 'Greece', startDate: '2025-06-14', endDate: '2025-06-18', purpose: 'travel' },
  // { place: 'Tokyo',     country: 'Japan',  startDate: '2025-03-20', endDate: '2025-03-28', purpose: 'travel', notes: 'Cherry blossom season' },
];

// Resolve all entries (add lat/lng/countryCode)
export const travelData: ResolvedTravelEntry[] = rawTravelData.map(resolveEntry);

/** Get unique countries */
export function getUniqueCountries(): string[] {
  return [...new Set(travelData.map((t) => t.country))].sort();
}

/** Get unique places */
export function getUniquePlaces(): string[] {
  return [...new Set(travelData.map((t) => t.place))].sort();
}
