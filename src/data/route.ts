/**
 * The route: every place Oscar has lived, in order.
 *
 * Drives the globe and the chapters of "The route". Coordinates come from
 * geocode-cache.json (see travel.ts for how to add a place). The photos are
 * free-to-use stand-ins (CC0, no credit needed); swap in your own by
 * replacing the files in public/images/places.
 */

import geocodeCache from './geocode-cache.json';

export interface PlacePhoto {
  src: string;
  alt: string;
}

export interface RouteStop {
  id: string;
  place: string;
  country: string;
  start: number;
  end?: number;
  note: string;
  photo: PlacePhoto;
}

export interface SideTrip {
  place: string;
  country: string;
  // The stop this trip branched off from
  from: string;
  year: number;
}

export interface StudyItem {
  id: string;
  chapter: string;
  title: string;
  org: string;
  period: string;
  blurb: string;
  logo?: string;
}

const photos: Record<string, PlacePhoto> = {
  bangkok: {
    src: '/images/places/bangkok.jpg',
    alt: 'The Bangkok skyline in evening light',
  },
  stockholm: {
    src: '/images/places/stockholm.jpg',
    alt: 'Södermalm’s waterfront in Stockholm, seen from Riddarholmen',
  },
  'al-ain': {
    src: '/images/places/al-ain.jpg',
    alt: 'The gate of a mud-brick fort in Al Ain',
  },
  egham: {
    src: '/images/places/egham.jpg',
    alt: 'The Founder’s Building of Royal Holloway in Egham',
  },
  dubai: {
    src: '/images/places/dubai.jpg',
    alt: 'The Dubai skyline at night, reflected in the water',
  },
  groningen: {
    src: '/images/places/groningen.jpg',
    alt: 'The Martinitoren at the end of the Oosterstraat in Groningen',
  },
  lausanne: {
    src: '/images/places/lausanne.jpg',
    alt: 'Boats on Lake Geneva at Lausanne, with the Alps beyond',
  },
  london: {
    src: '/images/places/london.jpg',
    alt: 'The City of London across the Thames at dusk',
  },
  basel: {
    src: '/images/places/basel.jpg',
    alt: 'The Rhine running through Basel',
  },
};

export const route: RouteStop[] = [
  { id: 'bangkok', place: 'Bangkok', country: 'Thailand', start: 2003, end: 2006, note: 'Born in Bangkok to a Swedish-American family.', photo: photos.bangkok },
  { id: 'stockholm-1', place: 'Stockholm', country: 'Sweden', start: 2006, end: 2007, note: 'A first year in Sweden.', photo: photos.stockholm },
  { id: 'al-ain', place: 'Al Ain', country: 'UAE', start: 2007, end: 2010, note: 'Childhood years in an oasis city in the Emirates.', photo: photos['al-ain'] },
  { id: 'egham', place: 'Egham', country: 'United Kingdom', start: 2010, end: 2012, note: 'Primary school in the English countryside.', photo: photos.egham },
  { id: 'dubai', place: 'Dubai', country: 'UAE', start: 2012, end: 2018, note: 'Middle school and the start of high school. The longest stretch in one place.', photo: photos.dubai },
  { id: 'stockholm-2', place: 'Stockholm', country: 'Sweden', start: 2018, end: 2021, note: 'Back to Sweden to finish school.', photo: photos.stockholm },
  { id: 'groningen', place: 'Groningen', country: 'Netherlands', start: 2021, end: 2024, note: 'A computer science degree, three internships, and seven courses as a teaching assistant.', photo: photos.groningen },
  { id: 'lausanne', place: 'Lausanne', country: 'Switzerland', start: 2024, end: 2026, note: 'A master’s at EPFL, and the most varied projects yet: hardware, language models, a hackathon.', photo: photos.lausanne },
  { id: 'london', place: 'London', country: 'United Kingdom', start: 2026, end: 2026, note: 'A six-month placement at Bloomberg, building real-time messaging infrastructure.', photo: photos.london },
  { id: 'basel', place: 'Basel', country: 'Switzerland', start: 2026, note: 'Master’s thesis at ETH Zurich, on generative models for antibodies.', photo: photos.basel },
];

export const sideTrips: SideTrip[] = [
  { place: 'Abu Dhabi', country: 'UAE', from: 'groningen', year: 2022 },
  { place: 'Veldhoven', country: 'Netherlands', from: 'groningen', year: 2023 },
];

export const studyItems: StudyItem[] = [
  { id: 'ib', chapter: 'stockholm-2', title: 'IB Diploma', org: 'International School of the Stockholm Region', period: '2018–2021', blurb: 'The International Baccalaureate diploma.', logo: '/images/logos/issr-mark.png' },
  { id: 'bsc', chapter: 'groningen', title: 'BSc Computer Science', org: 'University of Groningen', period: '2021–2024', blurb: 'Graduated cum laude (8.6/10), with the Honours College programme.', logo: '/images/logos/ugroningen-crest.svg' },
  { id: 'msc', chapter: 'lausanne', title: 'MSc Computer Science', org: 'EPFL', period: '2024–2027', blurb: 'A 5.4/6 average, with a minor in Management, Technology and Entrepreneurship. The thesis is at ETH Zurich.', logo: '/images/logos/epfl.svg' },
];

// ── Coordinates ────────────────────────────────────────────────────

const CACHE = geocodeCache as Record<string, { lat: number; lng: number }>;

export function coordsOf(place: string, country: string): [number, number] {
  const hit = CACHE[`${place}, ${country}`];
  if (!hit) throw new Error(`[route] No coordinates for "${place}, ${country}". Run: npx tsx scripts/geocode.ts`);
  return [hit.lng, hit.lat];
}

export function formatYears(start: number, end?: number): string {
  if (end === undefined) return `Since ${start}`;
  if (end === start) return `${start}`;
  return `${start}–${end}`;
}
