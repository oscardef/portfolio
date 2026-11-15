import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import usStates from '@/data/us-states-110m.json';
import { route, sideTrips, coordsOf } from '@/data/route';
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
  state?: string; // US places only
  lng: number;
  lat: number;
  home: boolean; // a place lived in, as opposed to visited
}

export interface GlobeData {
  stops: GlobeStop[];
  trips: GlobeTrip[];
  places: GlobePlace[];
  lived: string[]; // country ids
  visited: string[]; // country ids
  states: string[]; // US states visited, by name as in us-states-110m.json
}

// Names in travel.ts that differ from Natural Earth's
const COUNTRY_ALIASES: Record<string, string> = {
  UAE: 'United Arab Emirates',
  USA: 'United States of America',
};

type CountriesTopology = Topology<{ countries: GeometryCollection<{ name: string }> }>;
type StatesTopology = Topology<{ states: GeometryCollection<{ name: string }> }>;

export function getGlobeData(): GlobeData {
  const topology = world as unknown as CountriesTopology;
  const idByName = new Map(
    feature(topology, topology.objects.countries).features.map((f) => [f.properties.name, String(f.id)])
  );
  const countryId = (name: string) => idByName.get(COUNTRY_ALIASES[name] ?? name);

  const stops = route.map((s) => {
    const [lng, lat] = coordsOf(s.place, s.country);
    return { id: s.id, place: s.place, countryId: countryId(s.country), lng, lat };
  });

  const trips = sideTrips.map((t) => {
    const [lng, lat] = coordsOf(t.place, t.country);
    return { from: route.findIndex((s) => s.id === t.from), place: t.place, year: t.year, lng, lat };
  });

  const lived = [...new Set(route.map((s) => countryId(s.country)).filter((id): id is string => !!id))];

  const homes = new Set([...route, ...sideTrips].map((s) => `${s.place}, ${s.country}`));

  const seen = new Set<string>();
  const places: GlobePlace[] = [];
  for (const t of travelData) {
    const key = `${t.place}, ${t.country}`;
    if (seen.has(key) || t.countryCode === '??') continue;
    seen.add(key);
    places.push({
      place: t.place,
      country: t.country,
      ...(t.state ? { state: t.state } : {}),
      lng: t.lng,
      lat: t.lat,
      home: homes.has(key),
    });
  }

  const visited = [...new Set(travelData.map((t) => countryId(t.country)).filter((id): id is string => !!id))];

  // US states come from the `state` field in travel.ts; a name the map doesn't know is a typo
  const statesTopology = usStates as unknown as StatesTopology;
  const stateNames = new Set(
    feature(statesTopology, statesTopology.objects.states).features.map((f) => f.properties.name)
  );
  const states = [...new Set(travelData.filter((t) => t.country === 'USA' && t.state).map((t) => t.state!))];
  for (const s of states) {
    if (!stateNames.has(s)) throw new Error(`[globe] "${s}" in travel.ts is not a US state on the map`);
  }

  return { stops, trips, places, lived, visited, states };
}
