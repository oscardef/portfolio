/**
 * The route: every place Oscar has lived, in order.
 *
 * Drives the globe and the chapters of "The route". Coordinates come from
 * geocode-cache.json (see travel.ts for how to add a place). Photos are
 * freely licensed images from Wikimedia Commons, credited on the page;
 * swap in your own by replacing the files in public/images/places.
 */

import geocodeCache from './geocode-cache.json';

export interface PlacePhoto {
  src: string;
  alt: string;
  credit: string;
  href: string;
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
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

const photos: Record<string, PlacePhoto> = {
  bangkok: {
    src: '/images/places/bangkok.jpg',
    alt: 'The Bangkok skyline at twilight',
    credit: 'Sergei Gussev, CC BY 4.0',
    href: commons('Twilight_over_the_modern_city_skyline_in_Ratchadamri_district,_Bangkok,_Thailand,_July_2019_-_Flickr_-_sergei.gussev.jpg'),
  },
  stockholm: {
    src: '/images/places/stockholm.jpg',
    alt: 'Riddarholmen in Stockholm, seen across the water',
    credit: 'Dronepicr, CC BY 3.0',
    href: commons('Stockholm_Altstadt_Insel_(193365177).jpeg'),
  },
  'al-ain': {
    src: '/images/places/al-ain.jpg',
    alt: 'A path through the palm groves of the Al Ain Oasis',
    credit: 'trolvag, CC BY-SA 3.0',
    href: commons('Al_Ain_Oasis,_Al_Mutawaa_-_Abu_Dhabi_-_United_Arab_Emirates_-_panoramio.jpg'),
  },
  egham: {
    src: '/images/places/egham.jpg',
    alt: 'The Founder’s Building of Royal Holloway in Egham',
    credit: 'Diliff, CC BY-SA 3.0',
    href: commons('Founder%27s_Building,_Royal_Holloway,_University_of_London_-_Diliff.jpg'),
  },
  dubai: {
    src: '/images/places/dubai.jpg',
    alt: 'The Dubai skyline at night, reflected in the water',
    credit: 'Robert Bock, CC0',
    href: commons('Dubai_skyline_unsplash.jpg'),
  },
  groningen: {
    src: '/images/places/groningen.jpg',
    alt: 'The Martinitoren over the Grote Markt in Groningen',
    credit: 'Wutsje, CC BY-SA 3.0',
    href: commons('20100523_Grote_Markt_en_Martinitoren_Groningen_NL.jpg'),
  },
  lausanne: {
    src: '/images/places/lausanne.jpg',
    alt: 'Lake Geneva from the shore at Lausanne, with the Alps beyond',
    credit: 'OlhaSolodenko, CC BY-SA 4.0',
    href: commons('Lake_Geneva_in_Lausanne.jpg'),
  },
  london: {
    src: '/images/places/london.jpg',
    alt: 'Tower Bridge and the City of London at dusk',
    credit: 'Diliff, CC BY 3.0',
    href: commons('London_Thames_Sunset_panorama_-_Feb_2008.jpg'),
  },
  basel: {
    src: '/images/places/basel.jpg',
    alt: 'Basel Minster above the Rhine, seen from the Mittlere Brücke',
    credit: 'Michielverbeek, CC BY-SA 4.0',
    href: commons('Basel,_de_Basler_M%C3%BCnster_vanaf_de_Mittlere_Br%C3%BCcke_KGS1597_IMG_1453_2022-05-14_20.11.jpg'),
  },
};

export const route: RouteStop[] = [
  { id: 'bangkok', place: 'Bangkok', country: 'Thailand', start: 2003, end: 2006, note: 'Born in Bangkok to a Swedish-American family.', photo: photos.bangkok },
  { id: 'stockholm-1', place: 'Stockholm', country: 'Sweden', start: 2006, end: 2007, note: 'First move back to Scandinavia.', photo: photos.stockholm },
  { id: 'al-ain', place: 'Al Ain', country: 'UAE', start: 2007, end: 2010, note: 'Childhood years in an oasis city in the Emirates.', photo: photos['al-ain'] },
  { id: 'egham', place: 'Egham', country: 'United Kingdom', start: 2010, end: 2012, note: 'Primary school in the English countryside.', photo: photos.egham },
  { id: 'dubai', place: 'Dubai', country: 'UAE', start: 2012, end: 2018, note: 'Middle school and the start of high school. The longest stretch in one place.', photo: photos.dubai },
  { id: 'stockholm-2', place: 'Stockholm', country: 'Sweden', start: 2018, end: 2021, note: 'Back to Sweden to finish school.', photo: photos.stockholm },
  { id: 'groningen', place: 'Groningen', country: 'Netherlands', start: 2021, end: 2024, note: 'A computer science degree, three internships, and seven courses as a teaching assistant.', photo: photos.groningen },
  { id: 'lausanne', place: 'Lausanne', country: 'Switzerland', start: 2024, end: 2026, note: 'A master’s at EPFL, and the most varied projects yet: hardware, language models, a hackathon.', photo: photos.lausanne },
  { id: 'london', place: 'London', country: 'United Kingdom', start: 2026, end: 2026, note: 'A placement at Bloomberg, building real-time messaging infrastructure.', photo: photos.london },
  { id: 'basel', place: 'Basel', country: 'Switzerland', start: 2026, note: 'Master’s thesis at ETH Zurich, on generative models for antibodies.', photo: photos.basel },
];

export const sideTrips: SideTrip[] = [
  { place: 'Abu Dhabi', country: 'UAE', from: 'groningen', year: 2022 },
  { place: 'Veldhoven', country: 'Netherlands', from: 'groningen', year: 2023 },
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
// through rose and violet to teal (the latest stop).

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
