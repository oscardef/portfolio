import { getWorldMap } from '@/lib/geo';
import { travelData } from '@/data/travel';
import { route, sideTrips, hueOf } from '@/data/route';
import { PlacesExplorer, type Place } from './places-explorer';

/**
 * Every place visited, on one world map cropped to where they are. Places
 * lived or worked in take their colour from the route; trips are ink dots.
 */
export function Places() {
  const known = travelData.filter((t) => t.countryCode !== '??');
  const map = getWorldMap(known.map((t) => [t.lng, t.lat]));

  const homes = new Map<string, number>();
  route.forEach((s) => homes.set(`${s.place}, ${s.country}`, hueOf(s.id)));
  sideTrips.forEach((t) => homes.set(`${t.place}, ${t.country}`, hueOf(t.from)));

  const places = new Map<string, Place>();
  for (const entry of known) {
    const key = `${entry.place}, ${entry.country}`;
    if (places.has(key)) continue;
    const [x, y] = map.project([entry.lng, entry.lat]);
    places.set(key, {
      key,
      place: entry.place,
      country: entry.country,
      x: (x / map.width) * 100,
      y: (y / map.height) * 100,
      hue: homes.get(key) ?? null,
    });
  }

  // Homes last, so they sit on top of nearby trips
  const ordered = [...places.values()].sort((a, b) => Number(a.hue !== null) - Number(b.hue !== null));

  return (
    <PlacesExplorer
      places={ordered}
      map={{ width: map.width, height: map.height, land: map.land, graticule: map.graticule }}
    />
  );
}
