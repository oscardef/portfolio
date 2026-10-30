import type { CSSProperties } from 'react';
import { getRouteMaps, type RouteMapData } from '@/lib/geo';

/**
 * The hero map: every place lived, joined in order by one coloured route
 * that draws itself once on load. Europe is too dense at this scale, so it
 * gets an inset, as an atlas would. Pure SVG and CSS; no client JavaScript.
 */
export function RouteMap() {
  const { world, europe } = getRouteMaps();

  return (
    <figure className="overflow-x-clip">
      <div className="relative">
        <MapLayer data={world} id="world" />
        <div className="relative mt-6 overflow-hidden rounded-[3px] border border-rule bg-paper-raised shadow-[0_12px_32px_-16px_rgb(0_0_0/0.25)] md:absolute md:bottom-0 md:left-0 md:mt-0 md:w-[36%]">
          <p className="place-name absolute left-3 top-2 z-10 text-lg text-ink-2">Europe, enlarged</p>
          <MapLayer data={europe} id="europe" />
        </div>
      </div>
      <figcaption className="mt-5 text-sm text-ink-2 md:text-right">
        <span className="sr-only">
          The places Oscar has lived, in order: Bangkok, Stockholm, Al Ain, Egham, Dubai, Stockholm
          again, Groningen, Lausanne, London and Basel.{' '}
        </span>
        Every place I’ve lived, joined in order. Dashed lines are where work took me.
      </figcaption>
    </figure>
  );
}

function MapLayer({ data, id }: { data: RouteMapData; id: string }) {
  const visible = data.points.filter((p) => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${data.width} ${data.height}`}
        className="block h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {data.segments.map((s, i) => (
            <linearGradient
              key={i}
              id={`${id}-g${i}`}
              gradientUnits="userSpaceOnUse"
              x1={s.from[0]}
              y1={s.from[1]}
              x2={s.to[0]}
              y2={s.to[1]}
            >
              <stop offset="0" style={{ stopColor: `oklch(var(--route-l) var(--route-c) ${s.hueFrom})` }} />
              <stop offset="1" style={{ stopColor: `oklch(var(--route-l) var(--route-c) ${s.hueTo})` }} />
            </linearGradient>
          ))}
          {data.segments.map((s, i) =>
            s.side ? (
              <mask key={i} id={`${id}-m${i}`} maskUnits="userSpaceOnUse">
                <path
                  d={s.d}
                  pathLength={1}
                  className="route-seg route-mask"
                  style={{ '--delay': `${s.delay}s` } as CSSProperties}
                />
              </mask>
            ) : null
          )}
        </defs>

        <path className="map-graticule" d={data.graticule} />
        <path className="map-land" d={data.land} />
        {data.frame && <path className="map-frame" d={data.frame} />}

        {data.segments.map((s, i) =>
          s.side ? (
            <path
              key={i}
              d={s.d}
              className="route-trip"
              stroke={`url(#${id}-g${i})`}
              mask={`url(#${id}-m${i})`}
            />
          ) : (
            <path
              key={i}
              d={s.d}
              pathLength={1}
              className="route-seg"
              stroke={`url(#${id}-g${i})`}
              style={{ '--delay': `${s.delay}s` } as CSSProperties}
            />
          )
        )}
      </svg>

      {visible.map((p) => (
        <div
          key={p.key}
          className="route-point absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%`, '--delay': `${p.delay}s`, '--h': p.hue } as CSSProperties}
        >
          <span
            className="route-dot hue-bg absolute -translate-x-1/2 -translate-y-1/2"
            data-side={p.side || undefined}
          />
          {p.labelled && (
            <span className="route-label" data-anchor={p.anchor}>
              <span className="place-name block text-[1.0625rem] text-ink">{p.place}</span>
              <span className="tnum block text-xs text-ink-2">{p.years}</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
