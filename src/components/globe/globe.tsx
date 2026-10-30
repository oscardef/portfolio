'use client';

import { useEffect, useRef } from 'react';
import {
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  geoRotation,
} from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import type { GlobeData } from '@/lib/globe-data';

/**
 * A night-side globe drawn on a canvas with d3-geo's orthographic
 * projection. Countries lived in glow in their route colour; legs of the
 * route lift off the surface and draw themselves; the camera flies between
 * places. It only animates while on screen, and holds still for anyone who
 * prefers reduced motion.
 */

const topology = world as unknown as Topology<{ countries: GeometryCollection }>;
const COUNTRIES = feature(topology, topology.objects.countries).features;
const SPHERE = { type: 'Sphere' } as const;
const GRATICULE = geoGraticule10();

type LngLat = [number, number];

interface View {
  lng: number;
  lat: number;
  zoom: number;
}

interface Flight {
  from: View;
  to: View;
  start: number;
  duration: number;
}

export interface GlobeProps {
  data: GlobeData;
  mode: 'route' | 'travel';
  // Route mode: the stop in focus, or -1 for the whole route
  active?: number;
  // Travel mode: a place to turn to, e.g. when a country is chosen from the list
  focus?: { lng: number; lat: number } | null;
  className?: string;
}

const OVERVIEW: View = { lng: 42, lat: 32, zoom: 1 };
const TRAVEL: View = { lng: 15, lat: 28, zoom: 1 };
const LEG_SECONDS_INTRO = 1.1;
const LEG_SECONDS = 1.8;

const isEurope = (lng: number, lat: number) => lng > -12 && lng < 32 && lat > 36;

function viewFor(data: GlobeData, mode: GlobeProps['mode'], active: number): View {
  if (mode === 'travel') return TRAVEL;
  const stop = data.stops[active];
  if (!stop) return OVERVIEW;
  return { lng: stop.lng, lat: stop.lat - 4, zoom: isEurope(stop.lng, stop.lat) ? 2.3 : 1.55 };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Palette {
  oceanHi: string;
  oceanLo: string;
  glow: string;
  graticule: string;
  land: string;
  border: string;
  visited: string;
  ring: string;
  routeL: string;
  routeC: string;
}

function readPalette(el: Element): Palette {
  const s = getComputedStyle(el);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    oceanHi: v('--globe-ocean-hi'),
    oceanLo: v('--globe-ocean-lo'),
    glow: v('--globe-glow'),
    graticule: v('--globe-graticule'),
    land: v('--globe-land'),
    border: v('--globe-border'),
    visited: v('--globe-visited'),
    ring: v('--globe-ring'),
    routeL: v('--route-l') || '0.78',
    routeC: v('--route-c') || '0.13',
  };
}

export function Globe({ data, mode, active = -1, focus = null, className }: GlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // Everything the animation loop mutates lives here, outside React state
  const engine = useRef({
    view: viewFor(data, mode, active),
    flight: null as Flight | null,
    legs: data.stops.slice(1).map(() => 0),
    trips: data.trips.map(() => 0),
    raf: 0,
    last: 0,
    visible: false,
    reduced: false,
    dragging: false,
    idleUntil: 0,
    palette: null as Palette | null,
    size: { w: 0, h: 0, dpr: 1 },
    props: { mode, active },
    kick: () => {},
  });

  // Main loop and lifecycle
  useEffect(() => {
    const e = engine.current;
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext('2d')!;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    e.reduced = motion.matches;
    e.palette = readPalette(wrap);

    const colour = (hue: number, alpha = 1) =>
      `oklch(${e.palette!.routeL} ${e.palette!.routeC} ${hue} / ${alpha})`;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      e.size = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      draw(performance.now());
    }

    // Targets for the legs of the route given the current props
    function legTarget(i: number): number {
      const { mode, active } = e.props;
      if (mode === 'travel' || active < 0) return 1;
      return i < active ? 1 : 0;
    }

    function tripTarget(t: number): number {
      const { mode, active } = e.props;
      if (mode === 'travel' || active < 0) return 1;
      return active >= data.trips[t].from ? 1 : 0;
    }

    // Advance leg animations; returns true while anything is still moving
    function stepLegs(dt: number): boolean {
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

    function draw(now: number) {
      const { w, h, dpr } = e.size;
      if (!w || !h || !e.palette) return;
      const p = e.palette;
      const cx = (w / 2) * dpr;
      const cy = (h / 2) * dpr;
      const R = (Math.min(w, h) / 2) * 0.8 * e.view.zoom * dpr;
      const projection = geoOrthographic()
        .translate([cx, cy])
        .scale(R)
        .rotate([-e.view.lng, -e.view.lat])
        .clipAngle(90)
        .precision(0.6);
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Atmosphere and ocean
      ctx.save();
      ctx.beginPath();
      path(SPHERE);
      ctx.shadowColor = p.glow;
      ctx.shadowBlur = 70 * dpr;
      const ocean = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.05, cx, cy, R);
      ocean.addColorStop(0, p.oceanHi);
      ocean.addColorStop(1, p.oceanLo);
      ctx.fillStyle = ocean;
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      path(GRATICULE);
      ctx.strokeStyle = p.graticule;
      ctx.lineWidth = dpr;
      ctx.stroke();

      // Countries: all land first, then the ones that light up
      const { mode, active } = e.props;
      const activeStop = mode === 'route' ? data.stops[active] : undefined;
      ctx.beginPath();
      for (const c of COUNTRIES) path(c);
      ctx.fillStyle = p.land;
      ctx.fill();
      ctx.strokeStyle = p.border;
      ctx.lineWidth = 0.6 * dpr;
      ctx.stroke();

      for (const c of COUNTRIES) {
        const id = String(c.id);
        const livedHue = data.lived[id];
        let fill: string | null = null;
        if (mode === 'travel') {
          if (livedHue !== undefined) fill = colour(livedHue, 0.5);
          else if (data.visited.includes(id)) fill = p.visited;
        } else if (livedHue !== undefined) {
          const here = activeStop?.countryId === id;
          fill = colour(livedHue, here ? 0.62 : 0.4);
        }
        if (!fill) continue;
        ctx.beginPath();
        path(c);
        ctx.fillStyle = fill;
        ctx.fill();
      }

      // Legs of the route, lifted off the surface
      const drawArc = (a: LngLat, b: LngLat, progress: number, hueA: number, hueB: number, width: number) => {
        if (progress <= 0) return;
        const interpolate = geoInterpolate(a, b);
        const lift = 0.03 + 0.3 * (geoDistance(a, b) / Math.PI);
        const steps = Math.max(8, Math.ceil(72 * progress));
        const start = project(a);
        const end = project(interpolate(progress), lift * Math.sin(Math.PI * progress));
        const stroke = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        stroke.addColorStop(0, colour(hueA));
        stroke.addColorStop(1, colour(hueB));
        ctx.save();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width * dpr;
        ctx.lineCap = 'round';
        ctx.shadowColor = colour(hueB, 0.7);
        ctx.shadowBlur = 10 * dpr;
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
        ctx.stroke();
        if (progress < 1 && end.visible) {
          ctx.beginPath();
          ctx.arc(end.x, end.y, 3 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = colour(hueB);
          ctx.fill();
        }
        ctx.restore();
      };

      for (let i = 0; i < e.legs.length; i++) {
        const a = data.stops[i];
        const b = data.stops[i + 1];
        drawArc([a.lng, a.lat], [b.lng, b.lat], e.legs[i], a.hue, b.hue, mode === 'travel' ? 1.4 : 2.2);
      }
      data.trips.forEach((t, i) => {
        const a = data.stops[t.from];
        drawArc([a.lng, a.lat], [t.lng, t.lat], e.trips[i], a.hue, a.hue, mode === 'travel' ? 1.2 : 1.8);
      });

      // Places
      const dot = (x: number, y: number, r: number, fill: string) => {
        ctx.beginPath();
        ctx.arc(x, y, r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = 1.5 * dpr;
        ctx.strokeStyle = p.ring;
        ctx.stroke();
      };

      if (mode === 'travel') {
        for (const place of data.places) {
          if (place.hue !== null) continue;
          const pt = project([place.lng, place.lat]);
          if (pt.front) dot(pt.x, pt.y, 2.4, 'rgb(255 255 255 / 0.85)');
        }
      }
      const reached = (i: number) => mode === 'travel' || active < 0 || i <= active;
      data.stops.forEach((s, i) => {
        const pt = project([s.lng, s.lat]);
        if (!pt.front) return;
        dot(pt.x, pt.y, reached(i) ? 4 : 3, colour(s.hue, reached(i) ? 1 : 0.35));
      });
      data.trips.forEach((t, i) => {
        if (e.trips[i] < 1) return;
        const pt = project([t.lng, t.lat]);
        if (pt.front) dot(pt.x, pt.y, 3, colour(data.stops[t.from].hue));
      });

      // The place in focus: a pulsing ring and a label
      const label = labelRef.current;
      if (activeStop) {
        const pt = project([activeStop.lng, activeStop.lat]);
        if (pt.front) {
          if (!e.reduced) {
            const phase = (now / 1600) % 1;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, (5 + 16 * phase) * dpr, 0, Math.PI * 2);
            ctx.strokeStyle = colour(activeStop.hue, 0.9 * (1 - phase));
            ctx.lineWidth = 2 * dpr;
            ctx.stroke();
          }
          if (label) {
            label.style.opacity = '1';
            label.style.transform = `translate(${pt.x / dpr}px, ${pt.y / dpr}px)`;
          }
        } else if (label) {
          label.style.opacity = '0';
        }
      } else if (label) {
        label.style.opacity = '0';
      }
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - e.last) / 1000);
      e.last = now;
      let moving = false;

      if (e.flight) {
        const f = e.flight;
        const t = e.reduced ? 1 : Math.min(1, (now - f.start) / f.duration);
        const k = ease(t);
        const [lng, lat] = geoInterpolate([f.from.lng, f.from.lat], [f.to.lng, f.to.lat])(k);
        const distance = geoDistance([f.from.lng, f.from.lat], [f.to.lng, f.to.lat]);
        const dip = Math.min(0.35, distance * 0.45) * Math.sin(Math.PI * k);
        e.view = { lng, lat, zoom: (f.from.zoom + (f.to.zoom - f.from.zoom) * k) * (1 - dip) };
        if (t >= 1) e.flight = null;
        else moving = true;
      }

      moving = stepLegs(dt) || moving;

      const { mode, active } = e.props;
      if (mode === 'travel' && !e.reduced && !e.dragging && now > e.idleUntil && !e.flight) {
        e.view = { ...e.view, lng: e.view.lng + dt * 4 };
        moving = true;
      }
      const pulsing = mode === 'route' && active >= 0 && !e.reduced;

      draw(now);
      e.raf = (moving || pulsing) && e.visible ? requestAnimationFrame(tick) : 0;
    }

    e.kick = () => {
      if (e.raf || !e.visible) return;
      e.last = performance.now();
      e.raf = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);

    const visibility = new IntersectionObserver(([entry]) => {
      e.visible = entry.isIntersecting;
      if (e.visible) e.kick();
    });
    visibility.observe(wrap);

    const themeObserver = new MutationObserver(() => {
      e.palette = readPalette(wrap);
      draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const onMotion = () => {
      e.reduced = motion.matches;
      e.kick();
    };
    motion.addEventListener('change', onMotion);

    // Dragging spins the globe in travel mode
    let dragFrom: { x: number; y: number; view: View } | null = null;
    const onDown = (ev: PointerEvent) => {
      if (e.props.mode !== 'travel') return;
      dragFrom = { x: ev.clientX, y: ev.clientY, view: e.view };
      e.dragging = true;
      e.flight = null;
      canvas.setPointerCapture(ev.pointerId);
    };
    const onMove = (ev: PointerEvent) => {
      if (!dragFrom) return;
      const k = 0.3 / e.view.zoom;
      e.view = {
        ...e.view,
        lng: dragFrom.view.lng - (ev.clientX - dragFrom.x) * k,
        lat: Math.max(-60, Math.min(70, dragFrom.view.lat + (ev.clientY - dragFrom.y) * k)),
      };
      draw(performance.now());
    };
    const onUp = () => {
      dragFrom = null;
      e.dragging = false;
      e.idleUntil = performance.now() + 4000;
      e.kick();
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    resize();
    return () => {
      cancelAnimationFrame(e.raf);
      e.raf = 0;
      resizeObserver.disconnect();
      visibility.disconnect();
      themeObserver.disconnect();
      motion.removeEventListener('change', onMotion);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [data]);

  // New focus: fly there
  useEffect(() => {
    const e = engine.current;
    e.props = { mode, active };
    const to = focus ? { lng: focus.lng, lat: focus.lat, zoom: 1.6 } : viewFor(data, mode, active);
    const distance = geoDistance([e.view.lng, e.view.lat], [to.lng, to.lat]);
    e.flight = { from: e.view, to, start: performance.now(), duration: 1300 + 900 * Math.min(1, distance) };
    e.idleUntil = performance.now() + (focus ? 6000 : 0);
    e.kick();
  }, [data, mode, active, focus]);

  const activeStop = mode === 'route' ? data.stops[active] : undefined;

  return (
    // Callers position the globe (e.g. absolute inset-0); it fills that box
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        className="globe-fade absolute inset-0 h-full w-full"
        style={{ touchAction: mode === 'travel' ? 'pan-y' : 'auto', cursor: mode === 'travel' ? 'grab' : 'default' }}
        aria-hidden="true"
      />
      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 opacity-0 transition-opacity duration-300"
      >
        {activeStop && (
          <span className="place-name absolute bottom-3 left-3 whitespace-nowrap rounded-full bg-bg/80 px-3 py-1 text-lg text-text-primary backdrop-blur">
            {activeStop.place}
          </span>
        )}
      </div>
    </div>
  );
}
