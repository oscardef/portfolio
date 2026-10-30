/**
 * Map geometry, computed at build time in Server Components.
 *
 * Everything here returns plain strings and numbers (SVG path data and
 * projected points), so no map code or map data reaches the browser.
 * Land outlines are Natural Earth data via world-atlas.
 */

import {
  geoConicEqualArea,
  geoEqualEarth,
  geoGraticule,
  geoPath,
  type GeoPermissibleObjects,
  type GeoProjection,
} from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';
import land50 from 'world-atlas/land-50m.json';
import { route, sideTrips, coordsOf, stopHue, type LabelAnchor } from '@/data/route';

type LandTopology = Topology<{ land: GeometryCollection }>;

const landLow = feature(land110 as unknown as LandTopology, (land110 as unknown as LandTopology).objects.land);
const landHigh = feature(land50 as unknown as LandTopology, (land50 as unknown as LandTopology).objects.land);

interface Region {
  west: number;
  south: number;
  east: number;
  north: number;
}

// Points along a region's edges, so fitting follows the curved parallels
function regionOutline(r: Region, step = 2): [number, number][] {
  const pts: [number, number][] = [];
  for (let x = r.west; x <= r.east; x += step) pts.push([x, r.north]);
  for (let y = r.north; y >= r.south; y -= step) pts.push([r.east, y]);
  for (let x = r.east; x >= r.west; x -= step) pts.push([x, r.south]);
  for (let y = r.south; y <= r.north; y += step) pts.push([r.west, y]);
  return pts;
}

interface MapFrame {
  width: number;
  height: number;
  land: string;
  graticule: string;
  path: ReturnType<typeof geoPath>;
  project: (lngLat: [number, number]) => [number, number];
}

function frame(
  projection: GeoProjection,
  width: number,
  fitTo: GeoPermissibleObjects,
  landData: GeoPermissibleObjects,
  graticuleStep: number
): MapFrame {
  projection.fitWidth(width, fitTo);
  const [[, y0], [, y1]] = geoPath(projection).bounds(fitTo);
  const height = Math.ceil(y1 - y0);
  const [tx, ty] = projection.translate();
  projection.translate([tx, ty - y0]).clipExtent([
    [0, 0],
    [width, height],
  ]);

  const path = geoPath(projection).digits(1);
  return {
    width,
    height,
    land: path(landData) ?? '',
    graticule: path(geoGraticule().step([graticuleStep, graticuleStep])()) ?? '',
    path,
    project: (lngLat) => {
      const p = projection(lngLat);
      return p ? [round(p[0]), round(p[1])] : [0, 0];
    },
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

// A flight-map arc between two projected points, bowed towards the north
function arc(a: [number, number], b: [number, number]): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(dx, dy) || 1;
  let [nx, ny] = [-dy / len, dx / len];
  if (ny > 0) [nx, ny] = [-nx, -ny];
  const bow = len * 0.14;
  const c = [round((a[0] + b[0]) / 2 + nx * bow), round((a[1] + b[1]) / 2 + ny * bow)];
  return `M${a[0]},${a[1]}Q${c[0]},${c[1]} ${b[0]},${b[1]}`;
}

// ── Route map (hero) ───────────────────────────────────────────────

export interface MapPoint {
  key: string;
  place: string;
  years: string;
  x: number; // percent of map width
  y: number; // percent of map height
  hue: number;
  anchor: LabelAnchor;
  labelled: boolean;
  side: boolean;
  // Seconds after load when the route reaches this point
  delay: number;
}

export interface MapSegment {
  d: string;
  from: [number, number];
  to: [number, number];
  hueFrom: number;
  hueTo: number;
  delay: number;
  side: boolean;
}

export interface RouteMapData {
  width: number;
  height: number;
  land: string;
  graticule: string;
  frame?: string;
  segments: MapSegment[];
  points: MapPoint[];
}

const SEGMENT_START = 0.5;
const SEGMENT_STEP = 0.42;

function shortYears(start: number, end?: number): string {
  if (end === undefined) return `Since ${start}`;
  if (end === start) return `${start}`;
  return `${start}–${String(end).slice(2)}`;
}

function routeLayer(map: MapFrame, which: 'world' | 'europe'): Pick<RouteMapData, 'segments' | 'points'> {
  const projected = route.map((s) => map.project(coordsOf(s.place, s.country)));

  const segments: MapSegment[] = route.slice(1).map((_, i) => ({
    d: arc(projected[i], projected[i + 1]),
    from: projected[i],
    to: projected[i + 1],
    hueFrom: stopHue(i),
    hueTo: stopHue(i + 1),
    delay: SEGMENT_START + i * SEGMENT_STEP,
    side: false,
  }));

  // Stops reached at the end of the segment that leads to them
  const arrival = (i: number) => (i === 0 ? 0.2 : SEGMENT_START + (i - 1) * SEGMENT_STEP + SEGMENT_STEP);

  // One dot per place: Stockholm appears twice on the route
  const byPlace = new Map<string, MapPoint>();
  route.forEach((s, i) => {
    const [x, y] = projected[i];
    const existing = byPlace.get(s.place);
    if (existing) {
      existing.years += `, ${shortYears(s.start, s.end)}`;
      existing.hue = stopHue(i);
      return;
    }
    byPlace.set(s.place, {
      key: s.id,
      place: s.place,
      years: shortYears(s.start, s.end),
      x: (x / map.width) * 100,
      y: (y / map.height) * 100,
      hue: stopHue(i),
      anchor: s.anchor,
      labelled: s.map === which,
      side: false,
      delay: arrival(i),
    });
  });

  const points = [...byPlace.values()];

  sideTrips.forEach((t) => {
    const fromIndex = route.findIndex((s) => s.id === t.from);
    const a = projected[fromIndex];
    const b = map.project(coordsOf(t.place, t.country));
    const delay = arrival(fromIndex) + 0.1;
    segments.push({ d: arc(a, b), from: a, to: b, hueFrom: stopHue(fromIndex), hueTo: stopHue(fromIndex), delay, side: true });
    points.push({
      key: t.place.toLowerCase().replace(/\s+/g, '-'),
      place: t.place,
      years: String(t.year),
      x: (b[0] / map.width) * 100,
      y: (b[1] / map.height) * 100,
      hue: stopHue(fromIndex),
      anchor: t.anchor,
      labelled: t.map === which,
      side: true,
      delay: delay + SEGMENT_STEP,
    });
  });

  return { segments, points };
}

export const EUROPE: Region = { west: -4, south: 45, east: 23, north: 61 };
const ROUTE_REGION: Region = { west: -20, south: 4, east: 108, north: 64 };

export function getRouteMaps(): { world: RouteMapData; europe: RouteMapData } {
  // Equal Earth keeps parallels straight, so Europe sits upright like its inset
  const worldMap = frame(
    geoEqualEarth().rotate([-44, 0]),
    1000,
    { type: 'MultiPoint', coordinates: regionOutline(ROUTE_REGION) },
    landLow,
    10
  );
  const europeMap = frame(
    geoConicEqualArea().parallels([45, 58]).rotate([-8, 0]),
    480,
    { type: 'MultiPoint', coordinates: regionOutline(EUROPE, 1) },
    landHigh,
    5
  );

  const outline = regionOutline(EUROPE, 1);

  return {
    world: {
      width: worldMap.width,
      height: worldMap.height,
      land: worldMap.land,
      graticule: worldMap.graticule,
      frame: worldMap.path({ type: 'LineString', coordinates: [...outline, outline[0]] }) ?? undefined,
      ...routeLayer(worldMap, 'world'),
    },
    europe: {
      width: europeMap.width,
      height: europeMap.height,
      land: europeMap.land,
      graticule: europeMap.graticule,
      ...routeLayer(europeMap, 'europe'),
    },
  };
}

// ── World map (places) ─────────────────────────────────────────────

export interface WorldMapData {
  width: number;
  height: number;
  land: string;
  graticule: string;
  project: (lngLat: [number, number]) => [number, number];
}

// A world map cropped to the given places, with a margin around them
export function getWorldMap(places: [number, number][]): WorldMapData {
  const lngs = places.map(([lng]) => lng);
  const lats = places.map(([, lat]) => lat);
  const region: Region = {
    west: Math.max(-180, Math.min(...lngs) - 14),
    east: Math.min(180, Math.max(...lngs) + 14),
    south: Math.max(-60, Math.min(...lats) - 10),
    north: Math.min(78, Math.max(...lats) + 8),
  };
  const centre = (region.west + region.east) / 2;
  return frame(
    geoEqualEarth().rotate([-centre, 0]),
    1000,
    { type: 'MultiPoint', coordinates: regionOutline(region) },
    landLow,
    15
  );
}
