/**
 * The route: every place Oscar has lived, in order.
 *
 * Drives the hero map and the journey chapters. Coordinates come from
 * geocode-cache.json (see travel.ts for how to add a place).
 *
 * Label anchors say where a stop's label sits relative to its dot on the
 * maps: 'r' right, 'l' left, 't' above, 'b' below. `map` says which map
 * labels the stop: 'world' for the main map, 'europe' for the inset.
 */

import geocodeCache from './geocode-cache.json';

export type LabelAnchor = 'r' | 'l' | 't' | 'b';

export interface RouteStop {
  id: string;
  place: string;
  country: string;
  start: number;
  end?: number;
  note: string;
  map: 'world' | 'europe';
  anchor: LabelAnchor;
}

export interface SideTrip {
  place: string;
  country: string;
  // The stop this trip branched off from
  from: string;
  year: number;
  map: 'world' | 'europe';
  anchor: LabelAnchor;
}

export interface StudyItem {
  id: string;
  chapter: string;
  title: string;
  org: string;
  period: string;
  blurb: string;
}

export const route: RouteStop[] = [
  { id: 'bangkok', place: 'Bangkok', country: 'Thailand', start: 2003, end: 2006, note: 'Born in Bangkok to a Swedish-American family.', map: 'world', anchor: 'l' },
  { id: 'stockholm-1', place: 'Stockholm', country: 'Sweden', start: 2006, end: 2007, note: 'First move back to Scandinavia.', map: 'europe', anchor: 'l' },
  { id: 'al-ain', place: 'Al Ain', country: 'UAE', start: 2007, end: 2010, note: 'Childhood years in an oasis city in the Emirates.', map: 'world', anchor: 'b' },
  { id: 'egham', place: 'Egham', country: 'United Kingdom', start: 2010, end: 2012, note: 'Primary school in the English countryside.', map: 'europe', anchor: 'b' },
  { id: 'dubai', place: 'Dubai', country: 'UAE', start: 2012, end: 2018, note: 'Middle school and the start of high school. The longest stretch in one place.', map: 'world', anchor: 'r' },
  { id: 'stockholm-2', place: 'Stockholm', country: 'Sweden', start: 2018, end: 2021, note: 'Back to Sweden to finish school.', map: 'europe', anchor: 'r' },
  { id: 'groningen', place: 'Groningen', country: 'Netherlands', start: 2021, end: 2024, note: 'A computer science degree, three internships, and seven courses as a teaching assistant.', map: 'europe', anchor: 'r' },
  { id: 'lausanne', place: 'Lausanne', country: 'Switzerland', start: 2024, end: 2026, note: 'A master’s at EPFL, and the most varied projects yet: hardware, language models, a hackathon.', map: 'europe', anchor: 'l' },
  { id: 'london', place: 'London', country: 'United Kingdom', start: 2026, end: 2026, note: 'A placement at Bloomberg, building real-time messaging infrastructure.', map: 'europe', anchor: 't' },
  { id: 'basel', place: 'Basel', country: 'Switzerland', start: 2026, note: 'Master’s thesis at ETH Zurich, on generative models for antibodies.', map: 'europe', anchor: 'r' },
];

export const sideTrips: SideTrip[] = [
  { place: 'Abu Dhabi', country: 'UAE', from: 'groningen', year: 2022, map: 'world', anchor: 'l' },
  { place: 'Veldhoven', country: 'Netherlands', from: 'groningen', year: 2023, map: 'europe', anchor: 'b' },
];

export const studyItems: StudyItem[] = [
  { id: 'ib', chapter: 'stockholm-2', title: 'IB Diploma', org: 'International School of the Stockholm Region', period: '2018–2021', blurb: 'The International Baccalaureate diploma.' },
  { id: 'bsc', chapter: 'groningen', title: 'BSc Computer Science', org: 'University of Groningen', period: '2021–2024', blurb: 'Graduated cum laude (8.6/10), with the Honours College programme.' },
  { id: 'msc', chapter: 'lausanne', title: 'MSc Computer Science', org: 'EPFL', period: '2024–2027', blurb: 'A 5.4/6 average, with a minor in Management, Technology and Entrepreneurship. The thesis is at ETH Zurich.' },
];

// ── Coordinates ────────────────────────────────────────────────────

const CACHE = geocodeCache as Record<string, { lat: number; lng: number }>;

export function coordsOf(place: string, country: string): [number, number] {
  const hit = CACHE[`${place}, ${country}`];
  if (!hit) throw new Error(`[route] No coordinates for "${place}, ${country}". Run: npx tsx scripts/geocode.ts`);
  return [hit.lng, hit.lat];
}

// ── Colour ─────────────────────────────────────────────────────────
// Each stop takes a hue from a ramp that runs from saffron (Bangkok)
// through rose and violet to teal (the latest stop). Lightness and chroma
// come from the theme, so the same hue works on paper and on night.

const HUE_START = 75;
const HUE_SPAN = 250;

export function stopHue(index: number): number {
  const t = route.length > 1 ? index / (route.length - 1) : 0;
  return Math.round((((HUE_START - HUE_SPAN * t) % 360) + 360) % 360);
}

export function hueOf(stopId: string): number {
  const index = route.findIndex((s) => s.id === stopId);
  return stopHue(Math.max(index, 0));
}

export function formatYears(start: number, end?: number): string {
  if (end === undefined) return `Since ${start}`;
  if (end === start) return `${start}`;
  return `${start}–${end}`;
}
