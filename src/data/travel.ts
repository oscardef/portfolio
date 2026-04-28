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
 * BULK IMPORT FROM PHOTOS (automated pipeline):
 *
 *   Run the import script to extract GPS locations from your macOS Photos
 *   library, cluster them into places, and add them here automatically:
 *
 *     ./scripts/import-photo-locations.sh
 *
 *   Options:
 *     --after  2025-01-01   Only photos after this date
 *     --before 2025-12-31   Only photos before this date
 *     --dry-run             Preview without modifying files
 *     --skip-extract        Reuse previous photo extraction
 *
 *   See CONTENT_GUIDE.md § "Travel Data" for full documentation.
 * ─────────────────────────────────────────────────────────────────────
 */

import geocodeCache from './geocode-cache.json';

// ── User-facing type: only the fields you fill in ──────────────────
export interface TravelEntry {
  /** City, town, island, region — whatever you want to call the place */
  place: string;
  /** Country name */
  country: string;
  /** State or region (e.g. US states) — shown alongside country */
  state?: string;
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
  state?: string;
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
  // Feb 2026 — US Road Trip (Trip with Alina)
  { place: 'San Francisco',       country: 'USA', state: 'California', startDate: '2026-02-11', endDate: '2026-02-13', purpose: 'travel', notes: 'Trip with Alina' },
  { place: 'Carmel-By-The-Sea',   country: 'USA', state: 'California', startDate: '2026-02-13', endDate: '2026-02-13', purpose: 'travel', notes: 'Trip with Alina' },
  { place: 'Monterey',            country: 'USA', state: 'California', startDate: '2026-02-13', endDate: '2026-02-13', purpose: 'travel', notes: 'Trip with Alina' },
  { place: 'San Simeon',          country: 'USA', state: 'California', startDate: '2026-02-13', endDate: '2026-02-13', purpose: 'travel', notes: 'Trip with Alina' },
  { place: 'Los Angeles',         country: 'USA', state: 'California', startDate: '2026-02-14', endDate: '2026-02-16', purpose: 'travel', notes: 'Trip with Alina' },
  { place: 'Las Vegas',           country: 'USA', state: 'Nevada',     startDate: '2026-02-16', endDate: '2026-02-20', purpose: 'travel', notes: 'Trip with Alina' },
  { place: 'Austin',              country: 'USA', state: 'Texas',      startDate: '2026-02-20', endDate: '2026-02-23', purpose: 'travel', notes: 'Trip with Alina' },
  { place: 'Houston',             country: 'USA', state: 'Texas',      startDate: '2026-02-23', endDate: '2026-02-25', purpose: 'travel', notes: 'Trip with Alina' },

  // ── Earlier trips ──
  { place: 'Venice',        country: 'Italy',       startDate: '2008',                        purpose: 'travel' },
  { place: 'Kyiv',          country: 'Ukraine',     startDate: '2011',                        purpose: 'travel' },
  { place: 'Athens',        country: 'Greece',      startDate: '2015-02',                     purpose: 'travel', notes: 'School trip' },
  { place: 'Olympia',       country: 'Greece',      startDate: '2015-02',                     purpose: 'travel', notes: 'School trip' },
  { place: 'Addis Ababa',   country: 'Ethiopia',    startDate: '2016',                        purpose: 'travel', notes: 'School trip' },
  { place: 'New Delhi',     country: 'India',       startDate: '2017',                        purpose: 'travel', notes: 'School trip' },
  { place: 'Angkor Wat',    country: 'Cambodia',    startDate: '2017',                        purpose: 'travel', notes: 'School trip' },
  { place: 'Phnom Penh',    country: 'Cambodia',    startDate: '2017',                        purpose: 'travel', notes: 'School trip' },
  { place: 'Muscat',        country: 'Oman',        startDate: '2017',                        purpose: 'travel', notes: 'School trip' },
  { place: 'Seaside',       country: 'USA',         state: 'Florida', startDate: '2018',      purpose: 'travel' },
  { place: 'Helsinki',      country: 'Finland',     startDate: '2020',                        purpose: 'travel' },

  // ── Extracted from Photos ──
  { place: 'Phuket',          country: 'Thailand',     startDate: '2014-07-27',                          purpose: 'travel' },
  { place: 'Phuket',          country: 'Thailand',     startDate: '2015-04-01', endDate: '2015-04-06',   purpose: 'travel' },
  { place: 'Singapore',       country: 'Singapore',    startDate: '2019-12-18', endDate: '2020-01-07',   purpose: 'travel' },
  { place: 'Phuket',          country: 'Thailand',     startDate: '2019-12-19', endDate: '2020-01-05',   purpose: 'travel' },
  { place: 'Krabi',           country: 'Thailand',     startDate: '2019-12-30',                          purpose: 'travel' },
  { place: 'Eskilstuna',      country: 'Sweden',       startDate: '2020-07-18',                          purpose: 'travel' },
  { place: 'Falun',           country: 'Sweden',       startDate: '2020-08-01',                          purpose: 'travel' },
  { place: 'Copenhagen',      country: 'Denmark',      startDate: '2021-06-17',                          purpose: 'travel' },
  { place: 'Yosemite',        country: 'USA',          state: 'California', startDate: '2021-06-25', endDate: '2021-06-27', purpose: 'travel' },
  { place: 'Santa Barbara',   country: 'USA',          state: 'California', startDate: '2021-07-04', endDate: '2021-07-05', purpose: 'travel' },
  { place: 'Gilroy',          country: 'USA',          state: 'California', startDate: '2021-07-06',     purpose: 'travel' },
  { place: 'Loosdrecht',      country: 'Netherlands',  startDate: '2021-08-21', endDate: '2021-10-09',   purpose: 'travel' },
  { place: 'Phuket',          country: 'Thailand',     startDate: '2021-12-24', endDate: '2022-02-11',   purpose: 'travel' },
  { place: 'Almere',          country: 'Netherlands',  startDate: '2022-02-12', endDate: '2022-03-28',   purpose: 'travel' },
  { place: 'Prague',          country: 'Czechia',      startDate: '2022-03-11', endDate: '2022-03-13',   purpose: 'travel' },
  { place: 'Halmstad',        country: 'Sweden',       startDate: '2022-04-15',                          purpose: 'travel' },
  { place: 'Söderköping',     country: 'Sweden',       startDate: '2022-04-15',                          purpose: 'travel' },
  { place: 'Nynäshamn',       country: 'Sweden',       startDate: '2022-04-15', endDate: '2022-04-24',   purpose: 'travel' },
  { place: 'Amstelveen',      country: 'Netherlands',  startDate: '2022-06-04', endDate: '2022-11-08',   purpose: 'travel' },
  { place: 'Hatta',           country: 'UAE',          startDate: '2022-07-28', endDate: '2022-07-29',   purpose: 'travel' },
  { place: 'Mariestad',       country: 'Sweden',       startDate: '2022-08-12',                          purpose: 'travel' },
  { place: 'Lysekil',         country: 'Sweden',       startDate: '2022-08-12', endDate: '2022-08-13',   purpose: 'travel' },
  { place: 'Arnhem',          country: 'Netherlands',  startDate: '2022-11-26', endDate: '2022-11-27',   purpose: 'travel' },
  { place: 'Phuket',          country: 'Thailand',     startDate: '2022-12-24', endDate: '2023-01-21',   purpose: 'travel' },
  { place: 'Amsterdam',       country: 'Netherlands',  startDate: '2023-01-09',                          purpose: 'travel' },
  { place: 'Munich',          country: 'Germany',      startDate: '2023-02-08', endDate: '2023-02-13',   purpose: 'travel' },
  { place: 'Grainau',         country: 'Germany',      startDate: '2023-02-10', endDate: '2023-02-12',   purpose: 'travel' },
  { place: 'Dronten',         country: 'Netherlands',  startDate: '2023-04-27',                          purpose: 'travel' },
  { place: 'Ras Al Khaimah',  country: 'UAE',          startDate: '2023-05-19', endDate: '2023-05-20',   purpose: 'travel' },
  { place: 'Istanbul',        country: 'Turkey',       startDate: '2023-08-11', endDate: '2023-08-16',   purpose: 'travel' },
  { place: 'Ameland',         country: 'Netherlands',  startDate: '2023-08-28', endDate: '2023-09-01',   purpose: 'travel' },
  { place: 'Lelystad',        country: 'Netherlands',  startDate: '2023-12-14',                          purpose: 'travel' },
  { place: 'Phuket',          country: 'Thailand',     startDate: '2023-12-17', endDate: '2024-01-06',   purpose: 'travel' },
  { place: 'Khao Lak',        country: 'Thailand',     startDate: '2023-12-25',                          purpose: 'travel' },
  { place: 'Burgerveen',      country: 'Netherlands',  startDate: '2024-03-06', endDate: '2024-06-20',   purpose: 'travel' },
  { place: 'Paris',           country: 'France',       startDate: '2024-04-11', endDate: '2024-04-16',   purpose: 'travel' },
  { place: 'Disneyland Paris', country: 'France',      startDate: '2024-04-12',                          purpose: 'travel' },
  { place: 'Kigali',          country: 'Rwanda',       startDate: '2024-05-06', endDate: '2024-05-09',   purpose: 'travel' },
  { place: 'Málaga',          country: 'Spain',        startDate: '2024-06-30', endDate: '2024-07-04',   purpose: 'travel' },
  { place: 'Vienna',          country: 'Austria',      startDate: '2024-07-05', endDate: '2024-07-21',   purpose: 'travel' },
  { place: 'Königssee',       country: 'Germany',      startDate: '2024-07-15', endDate: '2024-07-17',   purpose: 'travel' },
  { place: 'Hallstatt',       country: 'Austria',      startDate: '2024-07-18',                          purpose: 'travel' },
  { place: 'Budapest',        country: 'Hungary',      startDate: '2024-07-19', endDate: '2024-07-20',   purpose: 'travel' },
  { place: 'Split',           country: 'Croatia',      startDate: '2024-07-22', endDate: '2024-08-02',   purpose: 'travel' },
  { place: 'Vela Luka',       country: 'Croatia',      startDate: '2024-07-27', endDate: '2024-08-02',   purpose: 'travel' },
  { place: 'Zurich',          country: 'Switzerland',   startDate: '2024-09-03', endDate: '2025-05-25',   purpose: 'travel' },
  { place: 'Cressier',        country: 'Switzerland',   startDate: '2024-09-23',                          purpose: 'travel' },
  { place: 'Palma',           country: 'Spain',        startDate: '2024-10-05', endDate: '2024-10-06',   purpose: 'travel' },
  { place: 'Uithoorn',        country: 'Netherlands',  startDate: '2024-10-19', endDate: '2024-11-22',   purpose: 'travel' },
  { place: 'Milan',           country: 'Italy',        startDate: '2024-10-24', endDate: '2024-10-27',   purpose: 'travel' },
  { place: 'Phuket',          country: 'Thailand',     startDate: '2024-12-25', endDate: '2025-01-04',   purpose: 'travel' },
  { place: 'Krabi',           country: 'Thailand',     startDate: '2024-12-30',                          purpose: 'travel' },
  { place: 'Prague',          country: 'Czechia',      startDate: '2025-02-09', endDate: '2025-02-11',   purpose: 'travel' },
  { place: 'Eckartsau',       country: 'Austria',      startDate: '2025-02-11', endDate: '2025-02-12',   purpose: 'travel' },
  { place: 'Munich',          country: 'Germany',      startDate: '2025-02-22', endDate: '2025-02-23',   purpose: 'travel' },
  { place: 'Rome',            country: 'Italy',        startDate: '2025-03-15', endDate: '2025-03-21',   purpose: 'travel' },
  { place: 'Rust',            country: 'Germany',      startDate: '2025-03-22',                          purpose: 'travel' },
  { place: 'Freiburg',        country: 'Germany',      startDate: '2025-03-23',                          purpose: 'travel' },
  { place: 'Amsterdam',       country: 'Netherlands',  startDate: '2025-04-23', endDate: '2025-06-11',   purpose: 'travel' },
  { place: 'Milan',           country: 'Italy',        startDate: '2025-05-03', endDate: '2025-05-17',   purpose: 'travel' },
  { place: 'Bratislava',      country: 'Slovakia',     startDate: '2025-05-20', endDate: '2025-05-23',   purpose: 'travel' },
  { place: 'Strängnäs',       country: 'Sweden',       startDate: '2025-06-07',                          purpose: 'travel' },
  { place: 'Sins',            country: 'Switzerland',   startDate: '2025-08-28', endDate: '2026-02-05',   purpose: 'travel' },
  { place: 'Milan',           country: 'Italy',        startDate: '2025-08-29', endDate: '2025-08-31',   purpose: 'travel' },
  { place: 'Athens',          country: 'Greece',       startDate: '2025-09-01', endDate: '2025-09-07',   purpose: 'travel' },
  { place: 'Naxos',           country: 'Greece',       startDate: '2025-09-05', endDate: '2025-09-07',   purpose: 'travel' },
  { place: 'Vienna',          country: 'Austria',      startDate: '2025-09-27', endDate: '2025-09-29',   purpose: 'travel' },
  { place: 'Bern',            country: 'Switzerland',   startDate: '2025-10-18',                          purpose: 'travel' },
  { place: 'Mondsee',         country: 'Austria',      startDate: '2025-12-18',                          purpose: 'travel' },
  { place: 'Haringsee',       country: 'Austria',      startDate: '2025-12-20', endDate: '2025-12-24',   purpose: 'travel' },
  { place: 'Trenčín',         country: 'Slovakia',     startDate: '2025-12-22',                          purpose: 'travel' },
  { place: 'Tenerife',        country: 'Spain',        startDate: '2025-12-24', endDate: '2026-01-05',   purpose: 'travel' },
];

// Resolve all entries (add lat/lng/countryCode)
export const travelData: ResolvedTravelEntry[] = rawTravelData.map(resolveEntry);

/** Get unique countries (US entries show state-level detail) */
export function getUniqueCountries(): string[] {
  return [...new Set(travelData.map((t) => t.country))].sort();
}

/** Get unique regions (countries + US states) */
export function getUniqueRegions(): string[] {
  return [...new Set(travelData.map((t) => t.state ? `${t.state}, ${t.country}` : t.country))].sort();
}

/** Get unique places */
export function getUniquePlaces(): string[] {
  return [...new Set(travelData.map((t) => t.place))].sort();
}
