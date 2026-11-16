'use client';

import { useEffect, useRef } from 'react';
import {
  geoContains,
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  geoRotation,
  type GeoPermissibleObjects,
} from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import usStates from '@/data/us-states-110m.json';
import type { GlobeData } from '@/lib/globe-data';

/**
 * A night-side globe drawn on a canvas with d3-geo's orthographic
 * projection. Two colours carry the meaning: teal for countries lived in,
 * the accent for countries visited, with the US states visited lit again
 * inside the United States. Legs of the route lift off the surface and draw
 * themselves. The camera follows its goal on a spring, so a new goal
 * mid-flight bends the motion instead of restarting it. The canvas only
 * redraws while something moves, and holds still for anyone who prefers
 * reduced motion.
 */

const topology = world as unknown as Topology<{ countries: GeometryCollection }>;
const COUNTRIES = feature(topology, topology.objects.countries).features;

// US states at the same 1:110m scale as the countries (Natural Earth, public domain)
const statesTopology = usStates as unknown as Topology<{ states: GeometryCollection<{ name: string }> }>;
const STATES = feature(statesTopology, statesTopology.objects.states).features;
const STATE_BORDERS = mesh(statesTopology, statesTopology.objects.states, (a, b) => a !== b);

const SPHERE = { type: 'Sphere' } as const;
const GRATICULE = geoGraticule10();

type LngLat = [number, number];

interface View {
  lng: number;
  lat: number;
  zoom: number;
}

export interface GlobeProps {
  data: GlobeData;
  mode: 'route' | 'travel';
  // Route mode: the stop in focus, or -1 for the whole route
  active?: number;
  // Travel mode: a place to turn to, e.g. when a country is chosen from the list
  focus?: { lng: number; lat: number; zoom?: number } | null;
  // Route mode: a side trip (index into data.trips) to fly out to from the place in focus
  detour?: number | null;
  // Travel mode: a country (by id) to outline as the one chosen
  highlight?: string | null;
  // Travel mode: the countries that can be pointed at and picked on the globe
  // itself (id to the text shown beside the pointer), and what picking one does
  labels?: Record<string, string>;
  onPick?: (id: string) => void;
  className?: string;
}

const OVERVIEW: View = { lng: 42, lat: 32, zoom: 1 };
const TRAVEL: View = { lng: 15, lat: 28, zoom: 1 };
const LEG_SECONDS_INTRO = 1.1;
const LEG_SECONDS = 1.8;

// The closest a side trip is shown. Beyond this the 1:110m country shapes look too coarse.
const TRIP_ZOOM_MAX = 16;

// How stiffly the camera follows its goal, in rad/s: turning, and zooming a touch behind it
const TURN = 3.4;
const ZOOM = 2.9;

const isEurope = (lng: number, lat: number) => lng > -12 && lng < 32 && lat > 36;

function viewFor(data: GlobeData, mode: GlobeProps['mode'], active: number, detour: number | null = null): View {
  if (mode === 'travel') return TRAVEL;
  const trip = detour === null ? undefined : data.trips[detour];
  if (trip) {
    // Frame both ends of the side trip. A short hop gets a much closer view,
    // so its two ends sit well apart instead of on top of each other.
    const home = data.stops[trip.from];
    const [lng, lat] = geoInterpolate([home.lng, home.lat], [trip.lng, trip.lat])(0.5);
    const distance = geoDistance([home.lng, home.lat], [trip.lng, trip.lat]);
    const zoom = Math.min(TRIP_ZOOM_MAX, Math.max(1.5, 0.5 / distance));
    return { lng, lat: lat - Math.min(1, 3.6 / zoom), zoom };
  }
  const stop = data.stops[active];
  if (!stop) return OVERVIEW;
  return isEurope(stop.lng, stop.lat)
    ? { lng: stop.lng + 2, lat: stop.lat - 1.5, zoom: 3.6 }
    : { lng: stop.lng, lat: stop.lat - 3, zoom: 1.9 };
}

// One step of a critically damped spring: it never overshoots, and its speed
// carries over when the goal moves
function spring(x: number, v: number, goal: number, omega: number, dt: number): [number, number] {
  const d = x - goal;
  const t = (v + omega * d) * dt;
  const decay = Math.exp(-omega * dt);
  return [goal + (d + t) * decay, (v - omega * t) * decay];
}

// An angle in degrees brought into [-180, 180)
const wrap = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

// A CSS colour at other opacities, for the stops of a gradient. The canvas
// normalises whatever notation the stylesheet ends up with (the build may
// rewrite it) to #rrggbb or rgba(r, g, b, a), which is easy to take apart.
function fades(ctx: CanvasRenderingContext2D, colour: string, scales: number[]): string[] {
  ctx.fillStyle = '#000';
  ctx.fillStyle = colour;
  const normal = String(ctx.fillStyle);
  const [r, g, b, a = 1] = normal.startsWith('#')
    ? [1, 3, 5].map((i) => parseInt(normal.slice(i, i + 2), 16))
    : (normal.match(/[\d.]+/g) ?? []).map(Number);
  return scales.map((k) => `rgba(${r}, ${g}, ${b}, ${(a * k).toFixed(3)})`);
}

interface Palette {
  oceanHi: string;
  oceanLo: string;
  // The atmosphere's colour at the globe's edge, part-way out, and where it ends
  halo: string[];
  graticule: string;
  land: string;
  border: string;
  visited: string;
  state: string;
  stateBorder: string;
  lived: string;
  livedActive: string;
  route: string;
  routeGlow: string;
  stop: string;
  stopDim: string;
  home: string;
  selected: string;
  selectedGlow: string;
  selectedFill: string;
  ring: string;
  place: string;
}

function readPalette(el: Element, ctx: CanvasRenderingContext2D): Palette {
  const s = getComputedStyle(el);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    oceanHi: v('--globe-ocean-hi'),
    oceanLo: v('--globe-ocean-lo'),
    halo: fades(ctx, v('--globe-glow'), [1, 0.3, 0]),
    graticule: v('--globe-graticule'),
    land: v('--globe-land'),
    border: v('--globe-border'),
    visited: v('--globe-visited'),
    state: v('--globe-state'),
    stateBorder: v('--globe-state-border'),
    lived: v('--globe-lived'),
    livedActive: v('--globe-lived-active'),
    route: v('--globe-route'),
    routeGlow: v('--globe-route-glow'),
    stop: v('--globe-stop'),
    stopDim: v('--globe-stop-dim'),
    home: v('--globe-home'),
    selected: v('--globe-selected'),
    selectedGlow: v('--globe-selected-glow'),
    selectedFill: v('--globe-selected-fill'),
    ring: v('--globe-ring'),
    place: v('--globe-place'),
  };
}

export function Globe({
  data,
  mode,
  active = -1,
  focus = null,
  detour = null,
  highlight = null,
  labels,
  onPick,
  className,
}: GlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  // The latest labels and pick handler, for the pointer handlers set up once below
  const picking = useRef({ labels, onPick });
  useEffect(() => {
    picking.current = { labels, onPick };
  });

  // Everything the animation loop mutates lives here, outside React state
  const engine = useRef({
    view: viewFor(data, mode, active, detour),
    goal: viewFor(data, mode, active, detour),
    speed: { lng: 0, lat: 0, zoom: 0 },
    legs: data.stops.slice(1).map(() => 0),
    trips: data.trips.map(() => 0),
    // The country outlined as chosen, fading in and out
    lit: { id: null as string | null, alpha: 0, on: false },
    // The country under the pointer, and whether the pointer is over the globe at all
    hover: null as string | null,
    pointerOver: false,
    raf: 0,
    wake: 0,
    last: 0,
    visible: false,
    reduced: false,
    dragging: false,
    idleUntil: 0,
    boost: 0,
    palette: null as Palette | null,
    size: { w: 0, h: 0, dpr: 1 },
    props: { mode, active, detour },
    kick: () => {},
  });

  // Main loop and lifecycle
  useEffect(() => {
    const e = engine.current;
    const canvas = canvasRef.current!;
    const wrapper = wrapRef.current!;
    const ctx = canvas.getContext('2d')!;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    e.reduced = motion.matches;
    e.palette = readPalette(wrapper, ctx);

    // The shapes that light up, picked out once
    const lived = new Set(data.lived);
    const visited = new Set(data.visited);
    const livedCountries = COUNTRIES.filter((c) => lived.has(String(c.id)));
    const visitedCountries = COUNTRIES.filter((c) => visited.has(String(c.id)) && !lived.has(String(c.id)));
    const visitedStates = STATES.filter((s) => data.states.includes(s.properties.name));
    const countryById = new Map(COUNTRIES.map((c) => [String(c.id), c]));

    // The section can enlarge the globe as it scrolls (--globe-boost on an ancestor)
    const readBoost = () => parseFloat(getComputedStyle(wrapper).getPropertyValue('--globe-boost')) || 0;

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      e.size = { w: rect.width, h: rect.height, dpr };
      e.boost = readBoost();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      draw();
      if (rect.width && rect.height) canvas.style.opacity = '1';
    }

    // Targets for the legs of the route given the current props
    function legTarget(i: number): number {
      const { mode, active } = e.props;
      if (mode === 'travel' || active < 0) return 1;
      return i < active ? 1 : 0;
    }

    function tripTarget(t: number): number {
      const { mode, detour } = e.props;
      return mode === 'route' && detour === t ? 1 : 0;
    }

    // Move the camera towards its goal; returns true while it is still moving
    function stepCamera(dt: number): boolean {
      const { view, goal, speed } = e;
      const turn = wrap(goal.lng - view.lng);
      const rest = () => {
        e.view = { lng: view.lng + turn, lat: goal.lat, zoom: goal.zoom };
        e.speed = { lng: 0, lat: 0, zoom: 0 };
      };
      if (e.reduced) {
        const moved = turn !== 0 || goal.lat !== view.lat || goal.zoom !== view.zoom;
        rest();
        return moved;
      }

      // A long way to go: pull back for the flight, and come in on arrival
      const remaining = geoDistance([view.lng, view.lat], [goal.lng, goal.lat]);
      const cruise = Math.max(goal.zoom / (1 + remaining * 1.1), Math.min(goal.zoom, 1));

      const [lng, vLng] = spring(view.lng, speed.lng, view.lng + turn, TURN, dt);
      const [lat, vLat] = spring(view.lat, speed.lat, goal.lat, TURN, dt);
      const [z, vZoom] = spring(Math.log(view.zoom), speed.zoom, Math.log(cruise), ZOOM, dt);
      e.view = { lng, lat, zoom: Math.exp(z) };
      e.speed = { lng: vLng, lat: vLat, zoom: vZoom };

      const arrived =
        Math.abs(turn) < 0.02 &&
        Math.abs(goal.lat - lat) < 0.02 &&
        Math.abs(z - Math.log(goal.zoom)) < 0.002 &&
        Math.abs(vLng) + Math.abs(vLat) < 0.05 &&
        Math.abs(vZoom) < 0.005;
      if (arrived) rest();
      return !arrived;
    }

    // Advance leg animations; returns true while anything is still moving
    function stepLegs(dt: number): boolean {
      if (e.props.mode === 'travel') return false;
      let moving = false;
      // The overview draws the whole route at a steady pace; a single new leg
      // takes its time, and a backlog from fast scrolling catches up quickly
      const pending = e.legs.filter((v, i) => v < legTarget(i)).length;
      const seconds = e.props.active < 0 ? LEG_SECONDS_INTRO : pending > 1 ? 0.45 : LEG_SECONDS;
      // Legs grow one at a time, in order, and shrink all at once
      let growing = false;
      for (let i = 0; i < e.legs.length; i++) {
        const target = legTarget(i);
        if (e.legs[i] > target) {
          e.legs[i] = e.reduced ? target : Math.max(target, e.legs[i] - dt * 3);
          moving ||= e.legs[i] !== target;
        } else if (e.legs[i] < target && !growing) {
          e.legs[i] = e.reduced ? target : Math.min(target, e.legs[i] + dt / seconds);
          growing = e.legs[i] < target;
          moving ||= growing;
        } else if (e.legs[i] < target) {
          moving = true;
        }
      }
      for (let t = 0; t < e.trips.length; t++) {
        const target = tripTarget(t);
        const fromLeg = data.trips[t].from - 1;
        const ready = fromLeg < 0 || e.legs[fromLeg] >= 1;
        if (e.trips[t] !== target && (ready || target < e.trips[t])) {
          const step = target > e.trips[t] ? dt / LEG_SECONDS : -dt * 3;
          e.trips[t] = e.reduced ? target : Math.min(1, Math.max(0, e.trips[t] + step));
          moving ||= e.trips[t] !== target;
        } else if (e.trips[t] !== target) {
          moving = true;
        }
      }
      return moving;
    }

    // The globe as it stands: its centre and radius on the canvas, and the projection
    function scene() {
      const { w, h, dpr } = e.size;
      const cx = (w / 2) * dpr;
      const cy = (h / 2) * dpr;
      const R = (Math.min(w, h) / 2) * 0.8 * e.view.zoom * (1 + e.boost) * dpr;
      const projection = geoOrthographic()
        .translate([cx, cy])
        .scale(R)
        .rotate([-e.view.lng, -e.view.lat])
        .clipAngle(90)
        .precision(0.6);
      return { cx, cy, R, projection };
    }

    // The pickable country under a point of the page, if any
    function countryAt(clientX: number, clientY: number): string | null {
      const ids = picking.current.labels;
      if (!ids || !e.size.w) return null;
      const rect = canvas.getBoundingClientRect();
      const { cx, cy, R, projection } = scene();
      const x = (clientX - rect.left) * e.size.dpr;
      const y = (clientY - rect.top) * e.size.dpr;
      if (Math.hypot(x - cx, y - cy) > R) return null;
      const point = projection.invert?.([x, y]);
      if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) return null;
      for (const id of Object.keys(ids)) {
        const shape = countryById.get(id);
        if (shape && geoContains(shape, point)) return id;
      }
      return null;
    }

    function draw() {
      const { w, h, dpr } = e.size;
      if (!w || !h || !e.palette) return;
      const p = e.palette;
      const { cx, cy, R, projection } = scene();
      const path = geoPath(projection, ctx);
      const rotate = geoRotation([-e.view.lng, -e.view.lat]);

      // Project with altitude: points above the surface sit further out from the centre
      const project = (lngLat: LngLat, altitude = 0) => {
        const [l, f] = rotate(lngLat).map((d) => (d * Math.PI) / 180);
        const X = Math.cos(f) * Math.sin(l);
        const Y = Math.sin(f);
        const Z = Math.cos(f) * Math.cos(l);
        const r = R * (1 + altitude);
        const visible = Z >= 0 || (X * X + Y * Y) * (1 + altitude) ** 2 >= 1;
        return { x: cx + r * X, y: cy - r * Y, visible, front: Z >= 0 };
      };

      const fill = (shapes: GeoPermissibleObjects[], colour: string) => {
        if (shapes.length === 0) return;
        ctx.beginPath();
        for (const s of shapes) path(s);
        ctx.fillStyle = colour;
        ctx.fill();
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Atmosphere: a halo that fades out from the edge of the globe
      const reach = 72 * dpr;
      const halo = ctx.createRadialGradient(cx, cy, R * 0.985, cx, cy, R + reach);
      halo.addColorStop(0, p.halo[0]);
      halo.addColorStop(0.4, p.halo[1]);
      halo.addColorStop(1, p.halo[2]);
      ctx.beginPath();
      ctx.arc(cx, cy, R + reach, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // Ocean
      ctx.beginPath();
      path(SPHERE);
      const ocean = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.05, cx, cy, R);
      ocean.addColorStop(0, p.oceanHi);
      ocean.addColorStop(1, p.oceanLo);
      ctx.fillStyle = ocean;
      ctx.fill();

      ctx.beginPath();
      path(GRATICULE);
      ctx.strokeStyle = p.graticule;
      ctx.lineWidth = dpr;
      ctx.stroke();

      // Countries: all land first, then the ones that light up
      const { mode, active, detour } = e.props;
      const activeStop = mode === 'route' ? data.stops[active] : undefined;
      const activeTrip = mode === 'route' && detour !== null ? data.trips[detour] : undefined;
      ctx.beginPath();
      for (const c of COUNTRIES) path(c);
      ctx.fillStyle = p.land;
      ctx.fill();
      ctx.strokeStyle = p.border;
      ctx.lineWidth = 0.6 * dpr;
      ctx.stroke();

      if (mode === 'travel') {
        fill(visitedCountries, p.visited);
        fill(livedCountries, p.lived);
        // The United States is lit as a whole; the states visited are lit again
        // on top, with the state lines drawn so they read as states
        if (visitedStates.length > 0) {
          fill(visitedStates, p.state);
          ctx.beginPath();
          path(STATE_BORDERS);
          ctx.strokeStyle = p.stateBorder;
          ctx.lineWidth = 0.6 * dpr;
          ctx.stroke();
        }
        // The country chosen from the list: a lighter fill and an outline with a
        // soft glow (two wide faint strokes under a crisp one)
        const chosen = e.lit.id && e.lit.alpha > 0 ? countryById.get(e.lit.id) : undefined;
        if (chosen) {
          ctx.save();
          ctx.globalAlpha = e.lit.alpha;
          ctx.lineJoin = 'round';
          ctx.beginPath();
          path(chosen);
          ctx.fillStyle = p.selectedFill;
          ctx.fill();
          ctx.strokeStyle = p.selectedGlow;
          ctx.lineWidth = 10 * dpr;
          ctx.stroke();
          ctx.lineWidth = 5 * dpr;
          ctx.stroke();
          ctx.strokeStyle = p.selected;
          ctx.lineWidth = 1.5 * dpr;
          ctx.stroke();
          ctx.restore();
        }
        // The country under the pointer: a lighter version of the same
        const pointed = e.hover && !(chosen && e.hover === e.lit.id) ? countryById.get(e.hover) : undefined;
        if (pointed) {
          ctx.save();
          ctx.beginPath();
          path(pointed);
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = p.selectedFill;
          ctx.fill();
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = p.selected;
          ctx.lineWidth = dpr;
          ctx.stroke();
          ctx.restore();
        }
      } else {
        const here = livedCountries.filter((c) => String(c.id) === activeStop?.countryId);
        fill(
          livedCountries.filter((c) => !here.includes(c)),
          p.lived
        );
        fill(here, p.livedActive);
      }

      // Legs of the route, lifted off the surface. A wide soft stroke under a
      // crisp one stands in for a glow (canvas shadows are slow to draw).
      const drawArc = (a: LngLat, b: LngLat, progress: number, width: number, dashed = false) => {
        if (progress <= 0) return;
        const interpolate = geoInterpolate(a, b);
        const lift = 0.03 + 0.3 * (geoDistance(a, b) / Math.PI);
        const steps = Math.max(8, Math.ceil(72 * progress));
        const trace = () => {
          ctx.beginPath();
          let pen = false;
          for (let s = 0; s <= steps; s++) {
            const t = (progress * s) / steps;
            const pt = project(interpolate(t), lift * Math.sin(Math.PI * t));
            if (!pt.visible) {
              pen = false;
              continue;
            }
            if (pen) ctx.lineTo(pt.x, pt.y);
            else ctx.moveTo(pt.x, pt.y);
            pen = true;
          }
        };
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        trace();
        if (dashed) {
          // Dots in the stop colour on a dark bed, so they show up on a lit country too
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = p.ring;
          ctx.lineWidth = width * 3 * dpr;
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.setLineDash([1, 7 * dpr]);
          ctx.strokeStyle = p.stop;
        } else {
          ctx.strokeStyle = p.routeGlow;
          ctx.lineWidth = width * 3.4 * dpr;
          ctx.stroke();
          ctx.strokeStyle = p.route;
        }
        ctx.lineWidth = width * dpr;
        ctx.stroke();
        ctx.restore();
        const end = project(interpolate(progress), lift * Math.sin(Math.PI * progress));
        if (progress < 1 && end.visible) {
          ctx.beginPath();
          ctx.arc(end.x, end.y, 3 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = p.stop;
          ctx.fill();
        }
      };

      if (mode === 'route') {
        for (let i = 0; i < e.legs.length; i++) {
          const a = data.stops[i];
          const b = data.stops[i + 1];
          drawArc([a.lng, a.lat], [b.lng, b.lat], e.legs[i], 2);
        }
        // Side trips are dotted, to tell them from moves
        data.trips.forEach((t, i) => {
          const a = data.stops[t.from];
          drawArc([a.lng, a.lat], [t.lng, t.lat], e.trips[i], 2.6, true);
        });
      }

      // Places
      const dot = (x: number, y: number, r: number, colour: string) => {
        ctx.beginPath();
        ctx.arc(x, y, r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = colour;
        ctx.fill();
        ctx.lineWidth = 1.5 * dpr;
        ctx.strokeStyle = p.ring;
        ctx.stroke();
      };

      if (mode === 'travel') {
        // Places visited as small dots, then homes on top, larger
        for (const home of [false, true]) {
          for (const place of data.places) {
            if (place.home !== home) continue;
            const pt = project([place.lng, place.lat]);
            if (pt.front) dot(pt.x, pt.y, home ? 4 : 2.3, home ? p.home : p.place);
          }
        }
      } else {
        const reached = (i: number) => active < 0 || i <= active;
        data.stops.forEach((s, i) => {
          const pt = project([s.lng, s.lat]);
          if (!pt.front) return;
          dot(pt.x, pt.y, i === active ? 5 : reached(i) ? 4 : 3, reached(i) ? p.stop : p.stopDim);
        });
        data.trips.forEach((t, i) => {
          if (e.trips[i] < 0.95) return;
          const pt = project([t.lng, t.lat]);
          if (pt.front) dot(pt.x, pt.y, 3.5, p.stop);
        });
      }

      // The place in focus: its label and pulsing ring follow it (the ring is CSS)
      const label = labelRef.current;
      const focusPoint = activeTrip ?? activeStop;
      if (label) {
        const pt = focusPoint && activeStop ? project([focusPoint.lng, focusPoint.lat]) : null;
        if (pt?.front) {
          label.style.opacity = '1';
          label.style.transform = `translate(${(pt.x / dpr).toFixed(1)}px, ${(pt.y / dpr).toFixed(1)}px)`;
        } else {
          label.style.opacity = '0';
        }
      }
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - e.last) / 1000);
      e.last = now;

      let moving = stepCamera(dt);
      moving = stepLegs(dt) || moving;

      // The chosen country's outline fades in and out
      const lit = e.lit.on ? 1 : 0;
      if (e.lit.alpha !== lit) {
        const step = dt * 3.5 * (lit > e.lit.alpha ? 1 : -1);
        e.lit.alpha = e.reduced ? lit : Math.min(1, Math.max(0, e.lit.alpha + step));
        moving = true;
      }

      // Left alone and zoomed out, the travel globe turns slowly
      const { mode } = e.props;
      if (mode === 'travel' && !e.reduced && !e.dragging && !e.pointerOver && !moving && e.goal.zoom < 1.2) {
        if (now > e.idleUntil) {
          const turn = dt * 4;
          e.view = { ...e.view, lng: e.view.lng + turn };
          e.goal = { ...e.goal, lng: e.goal.lng + turn };
          moving = true;
        } else if (!e.wake) {
          e.wake = window.setTimeout(() => {
            e.wake = 0;
            e.kick();
          }, e.idleUntil - now + 20);
        }
      }

      draw();
      e.raf = moving && e.visible ? requestAnimationFrame(tick) : 0;
    }

    e.kick = () => {
      if (e.raf || !e.visible) return;
      e.last = performance.now();
      e.raf = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    const visibility = new IntersectionObserver(([entry]) => {
      e.visible = entry.isIntersecting;
      if (e.visible) e.kick();
    });
    visibility.observe(wrapper);

    const themeObserver = new MutationObserver(() => {
      e.palette = readPalette(wrapper, ctx);
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // The route's globe changes size as its section scrolls into place: at
    // most one redraw a frame, and only when the size really changed
    let scrollFrame = 0;
    const onScroll = () => {
      if (e.props.mode !== 'route' || !e.visible || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const boost = readBoost();
        if (boost === e.boost) return;
        e.boost = boost;
        if (!e.raf) draw();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onMotion = () => {
      e.reduced = motion.matches;
      e.kick();
    };
    motion.addEventListener('change', onMotion);

    // Pointing at a country names it beside the pointer and lights it a little;
    // the globe stops turning while the pointer is over it, so it can be aimed at
    const tip = tipRef.current;
    let hoverFrame = 0;
    const point = (id: string | null, ev?: PointerEvent) => {
      if (tip) {
        const text = id ? picking.current.labels?.[id] : undefined;
        tip.style.display = text ? 'block' : 'none';
        if (text && ev) {
          const rect = wrapper.getBoundingClientRect();
          tip.textContent = text;
          tip.style.left = `${ev.clientX - rect.left}px`;
          tip.style.top = `${ev.clientY - rect.top}px`;
        }
      }
      if (id === e.hover) return;
      e.hover = id;
      if (!dragFrom) canvas.style.cursor = id ? 'pointer' : 'grab';
      if (!e.raf) draw();
    };
    const onHover = (ev: PointerEvent) => {
      if (e.props.mode !== 'travel' || ev.pointerType !== 'mouse' || dragFrom || hoverFrame) return;
      hoverFrame = requestAnimationFrame(() => {
        hoverFrame = 0;
        point(countryAt(ev.clientX, ev.clientY), ev);
      });
    };
    const onEnter = (ev: PointerEvent) => {
      if (ev.pointerType === 'mouse') e.pointerOver = true;
    };
    const onLeave = () => {
      e.pointerOver = false;
      point(null);
      e.kick();
    };

    // Dragging spins the globe in travel mode; a click or tap that doesn't move picks a country
    let dragFrom: { x: number; y: number; view: View } | null = null;
    let dragFrame = 0;
    let dragged = false;
    const onDown = (ev: PointerEvent) => {
      if (e.props.mode !== 'travel') return;
      dragged = false;
      dragFrom = { x: ev.clientX, y: ev.clientY, view: e.view };
      e.dragging = true;
      e.speed = { lng: 0, lat: 0, zoom: 0 };
      canvas.setPointerCapture(ev.pointerId);
      canvas.style.cursor = 'grabbing';
    };
    const onMove = (ev: PointerEvent) => {
      if (!dragFrom) return onHover(ev);
      if (!dragged && Math.hypot(ev.clientX - dragFrom.x, ev.clientY - dragFrom.y) < 5) return;
      if (!dragged) point(null);
      dragged = true;
      const k = 0.3 / e.view.zoom;
      e.view = {
        ...e.view,
        lng: dragFrom.view.lng - (ev.clientX - dragFrom.x) * k,
        lat: Math.max(-60, Math.min(70, dragFrom.view.lat + (ev.clientY - dragFrom.y) * k)),
      };
      // The goal follows the hand, so letting go doesn't pull the globe back
      e.goal = { ...e.goal, lng: e.view.lng, lat: e.view.lat };
      if (!dragFrame && !e.raf) {
        dragFrame = requestAnimationFrame(() => {
          dragFrame = 0;
          draw();
        });
      }
    };
    const onUp = (ev: PointerEvent) => {
      if (!dragFrom) return;
      dragFrom = null;
      e.dragging = false;
      e.idleUntil = performance.now() + 4000;
      canvas.style.cursor = e.hover ? 'pointer' : 'grab';
      if (!dragged && ev.type === 'pointerup') {
        const id = countryAt(ev.clientX, ev.clientY);
        if (id) {
          // The globe is about to move under the pointer, so the name beside it goes
          point(null);
          picking.current.onPick?.(id);
        }
      }
      e.kick();
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerenter', onEnter);
    canvas.addEventListener('pointerleave', onLeave);

    resize();
    return () => {
      cancelAnimationFrame(e.raf);
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(dragFrame);
      cancelAnimationFrame(hoverFrame);
      window.clearTimeout(e.wake);
      e.raf = 0;
      e.wake = 0;
      resizeObserver.disconnect();
      visibility.disconnect();
      themeObserver.disconnect();
      motion.removeEventListener('change', onMotion);
      window.removeEventListener('scroll', onScroll);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [data]);

  // A new place in focus: point the camera's goal at it and let the spring do the rest
  useEffect(() => {
    const e = engine.current;
    e.props = { mode, active, detour };
    if (highlight) e.lit = { id: highlight, alpha: e.lit.id === highlight ? e.lit.alpha : 0, on: true };
    else e.lit.on = false;
    if (focus) e.goal = { lng: focus.lng, lat: focus.lat, zoom: focus.zoom ?? 2.5 };
    // Back to the whole world from wherever the globe has turned to
    else if (mode === 'travel') e.goal = { lng: e.view.lng, lat: TRAVEL.lat, zoom: TRAVEL.zoom };
    else e.goal = viewFor(data, mode, active, detour);
    e.idleUntil = performance.now() + (focus ? 6000 : 0);
    e.kick();
  }, [data, mode, active, focus, detour, highlight]);

  const trip = mode === 'route' && detour !== null ? data.trips[detour] : undefined;
  const stop = mode === 'route' ? data.stops[active] : undefined;
  const label = trip ? { place: trip.place, note: String(trip.year) } : stop ? { place: stop.place, note: '' } : null;

  return (
    // Callers position the globe (e.g. absolute inset-0); it fills that box
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        className="globe-fade absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
        style={{
          touchAction: mode === 'travel' ? 'pan-y' : 'auto',
          cursor: mode === 'travel' ? 'grab' : 'default',
          pointerEvents: mode === 'travel' ? 'auto' : 'none',
        }}
        aria-hidden="true"
      />
      {/* The label and ring of the place in focus, clipped to the globe's box.
          Mid-flight that place can be far outside the box, and on a phone the
          label would otherwise make the whole page wider than the screen. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div ref={labelRef} className="absolute left-0 top-0 opacity-0 transition-opacity duration-300">
          {label && (
            <>
              <span className="globe-pulse" />
              <span className="absolute bottom-3 left-3 flex items-baseline gap-2 whitespace-nowrap rounded-full bg-bg/80 px-3 py-1 backdrop-blur">
                <span className="place-name text-lg text-text-primary">{label.place}</span>
                {label.note && <span className="tnum text-xs text-text-muted">{label.note}</span>}
              </span>
            </>
          )}
        </div>
      </div>
      {/* Names the country under the pointer */}
      <div
        ref={tipRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-[calc(100%+0.75rem)] whitespace-nowrap rounded-full border border-border bg-bg/90 px-3 py-1 text-sm text-text-primary backdrop-blur"
      />
    </div>
  );
}
