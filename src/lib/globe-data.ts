import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { route, sideTrips, coordsOf, stopHue } from '@/data/route';
import { travelData } from '@/data/travel';

/**
 * Everything the globe needs, computed at build time and passed to the
 * client as plain data. Country ids are the ISO numeric ids used by
 * world-atlas, so the client can light up shapes without a name lookup.
 */

export interface GlobeStop {
  id: string;
  place: string;
  countryId?: string;
  lng: number;
  lat: number;
  hue: number;
}

export interface GlobeTrip {
  from: number; // index into stops
  place: string;
  year: number;
  lng: number;
  lat: number;
}

export interface GlobePlace {
  place: string;
  country: string;
  lng: number;
  lat: number;
  hue: number | null; // route colour for places lived; null for trips
}

export interface GlobeData {
  stops: GlobeStop[];
  trips: GlobeTrip[];
  places: GlobePlace[];
  lived: Record<string, number>; // country id -> hue of the latest stop there
  visited: string[]; // country ids
}

// Names in travel.ts that differ from Natural Earth's
const COUNTRY_ALIASES: Record<string, string> = {
  UAE: 'United Arab Emirates',
  USA: 'United States of America',
};

type CountriesTopology = Topology<{ countries: GeometryCollection<{ name: string }> }>;

export function getGlobeData(): GlobeData {
  const topology = world as unknown as CountriesTopology;
  const idByName = new Map(
    feature(topology, topology.objects.countries).features.map((f) => [f.properties.name, String(f.id)])
  );
  const countryId = (name: string) => idByName.get(COUNTRY_ALIASES[name] ?? name);

  const stops = route.map((s, i) => {
    const [lng, lat] = coordsOf(s.place, s.country);
    return { id: s.id, place: s.place, countryId: countryId(s.country), lng, lat, hue: stopHue(i) };
  });

  const trips = sideTrips.map((t) => {
    const [lng, lat] = coordsOf(t.place, t.country);
    return { from: route.findIndex((s) => s.id === t.from), place: t.place, year: t.year, lng, lat };
  });

  const lived: Record<string, number> = {};
  route.forEach((s, i) => {
    const id = countryId(s.country);
    if (id) lived[id] = stopHue(i);
  });

  const homeHue = new Map<string, number>();
  route.forEach((s, i) => homeHue.set(`${s.place}, ${s.country}`, stopHue(i)));
  sideTrips.forEach((t) => homeHue.set(`${t.place}, ${t.country}`, stopHue(route.findIndex((s) => s.id === t.from))));

  const seen = new Set<string>();
  const places: GlobePlace[] = [];
  for (const t of travelData) {
    const key = `${t.place}, ${t.country}`;
    if (seen.has(key) || t.countryCode === '??') continue;
    seen.add(key);
    places.push({ place: t.place, country: t.country, lng: t.lng, lat: t.lat, hue: homeHue.get(key) ?? null });
  }

  const visited = [...new Set(travelData.map((t) => countryId(t.country)).filter((id): id is string => !!id))];

  return { stops, trips, places, lived, visited };
}
