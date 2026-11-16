import { geoArea, geoCentroid, geoDistance, geoInterpolate } from 'd3-geo';
import type { Polygon } from 'geojson';
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

// Where the camera goes when a country is chosen from the list
export interface GlobeFrame {
  id: string | null; // the country's shape on the globe, if the map has one
  lng: number;
  lat: number;
  zoom: number;
}

export interface GlobeData {
  stops: GlobeStop[];
  trips: GlobeTrip[];
  places: GlobePlace[];
  frames: Record<string, GlobeFrame>; // by country name as written in travel.ts
  moved: number; // km between homes, along the great circles the route draws
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

const DEGREES = Math.PI / 180;
const EARTH_RADIUS_KM = 6371;

// A circle around a country: its largest landmass (so the United States is
// framed without Alaska, France without Guiana), widened to take in any
// place visited that lies off it (Tenerife for Spain, Copenhagen for Denmark).
// Returns the centre and the zoom that makes the circle fill most of the globe's box.
function frame(
  landmasses: Polygon['coordinates'][],
  places: GlobePlace[]
): { lng: number; lat: number; zoom: number } {
  let centre: [number, number];
  let radius: number;
  if (landmasses.length > 0) {
    const main = landmasses
      .map((coordinates): Polygon => ({ type: 'Polygon', coordinates }))
      .sort((a, b) => geoArea(b) - geoArea(a))[0];
    centre = geoCentroid(main);
    radius = Math.max(...main.coordinates[0].map((point) => geoDistance(centre, point as [number, number])));
  } else {
    // A country too small for the map (Singapore): frame its places instead
    centre = [
      places.reduce((sum, p) => sum + p.lng, 0) / places.length,
      places.reduce((sum, p) => sum + p.lat, 0) / places.length,
    ];
    radius = 1.5 * DEGREES;
  }
  for (const place of places) {
    const here: [number, number] = [place.lng, place.lat];
    const distance = geoDistance(centre, here);
    if (distance <= radius) continue;
    // The smallest circle holding both the old circle and this place, with a little margin
    const reach = distance * 1.08;
    centre = geoInterpolate(centre, here)((reach - radius) / 2 / distance);
    radius = (radius + reach) / 2;
  }
  const zoom = Math.min(9, Math.max(1.6, 0.9 / Math.sin(Math.min(radius, Math.PI / 2))));
  return { lng: centre[0], lat: centre[1], zoom: Math.round(zoom * 100) / 100 };
}

export function getGlobeData(): GlobeData {
  const topology = world as unknown as CountriesTopology;
  const countries = feature(topology, topology.objects.countries).features;
  const idByName = new Map(countries.map((f) => [f.properties.name, String(f.id)]));
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

  const frames: Record<string, GlobeFrame> = {};
  for (const country of new Set(places.map((p) => p.country))) {
    const id = countryId(country) ?? null;
    const geometry = countries.find((f) => String(f.id) === id)?.geometry;
    const landmasses =
      geometry?.type === 'Polygon' ? [geometry.coordinates] : geometry?.type === 'MultiPolygon' ? geometry.coordinates : [];
    frames[country] = { id, ...frame(landmasses, places.filter((p) => p.country === country)) };
  }

  // US states come from the `state` field in travel.ts; a name the map doesn't know is a typo
  const statesTopology = usStates as unknown as StatesTopology;
  const stateNames = new Set(
    feature(statesTopology, statesTopology.objects.states).features.map((f) => f.properties.name)
  );
  const states = [...new Set(travelData.filter((t) => t.country === 'USA' && t.state).map((t) => t.state!))];
  for (const s of states) {
    if (!stateNames.has(s)) throw new Error(`[globe] "${s}" in travel.ts is not a US state on the map`);
  }

  const moved = stops.slice(1).reduce((sum, s, i) => {
    const a = stops[i];
    return sum + geoDistance([a.lng, a.lat], [s.lng, s.lat]) * EARTH_RADIUS_KM;
  }, 0);

  return { stops, trips, places, frames, moved, lived, visited, states };
}
