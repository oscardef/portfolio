import { ImageResponse } from 'next/og';
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { getGlobeData } from '@/lib/globe-data';

export const alt = 'Oscar de Francesca, software engineer, with a globe of the places he has lived';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Satori can't resolve CSS variables or oklch(), so route colours are converted here
function oklchToHex(l: number, c: number, hue: number): string {
  const h = (hue * Math.PI) / 180;
  const [a, b] = [c * Math.cos(h), c * Math.sin(h)];
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707612701 * s_,
  ];
  return `#${rgb
    .map((x) => {
      const v = Math.min(1, Math.max(0, x));
      const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
      return Math.round(srgb * 255)
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
}

const routeColour = (hue: number) => oklchToHex(0.78, 0.13, hue);

export default function Image() {
  const data = getGlobeData();
  const topology = world as unknown as Topology<{ countries: GeometryCollection }>;
  const countries = feature(topology, topology.objects.countries).features;

  const SIZE = 640;
  const projection = geoOrthographic()
    .translate([SIZE / 2, SIZE / 2])
    .scale(SIZE * 0.46)
    .rotate([-45, -30])
    .clipAngle(90);
  const path = geoPath(projection).digits(1);

  const legs = data.stops.slice(1).map((b, i) => {
    const a = data.stops[i];
    return { d: path({ type: 'LineString', coordinates: [[a.lng, a.lat], [b.lng, b.lat]] }) ?? '', hue: b.hue };
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, #0c1220 0%, #131b2c 60%, #0c1220 100%)',
          color: '#eef2f8',
          fontFamily: 'sans-serif',
        }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', right: -40, top: 0 }}>
          <defs>
            <radialGradient id="ocean" cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor="#1a2843" />
              <stop offset="1" stopColor="#0a1020" />
            </radialGradient>
          </defs>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE * 0.47} fill="#6d72f6" fillOpacity={0.12} />
          <path d={path({ type: 'Sphere' }) ?? ''} fill="url(#ocean)" />
          <path d={path(geoGraticule10()) ?? ''} fill="none" stroke="#ffffff" strokeOpacity={0.05} />
          {countries.map((c) => {
            const hue = data.lived[String(c.id)];
            return (
              <path
                key={String(c.id)}
                d={path(c) ?? ''}
                fill={hue === undefined ? '#94a3b8' : routeColour(hue)}
                fillOpacity={hue === undefined ? 0.13 : 0.45}
                stroke="#94a3b8"
                strokeOpacity={0.22}
                strokeWidth={0.6}
              />
            );
          })}
          {legs.map((leg, i) => (
            <path key={i} d={leg.d} fill="none" stroke={routeColour(leg.hue)} strokeWidth={3} strokeLinecap="round" />
          ))}
          {data.stops.map((s) => {
            const p = projection([s.lng, s.lat]);
            return p ? (
              <circle key={s.id} cx={p[0]} cy={p[1]} r={6} fill={routeColour(s.hue)} stroke="#0c1220" strokeWidth={2.5} />
            ) : null;
          })}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '78px 80px', maxWidth: 640 }}>
          <div style={{ fontSize: 86, fontWeight: 600, lineHeight: 0.98, letterSpacing: '-0.035em' }}>
            Oscar de Francesca
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.32, marginTop: 30, color: '#b0bacb' }}>
            Software engineer, Swedish and American, born in Bangkok and raised across Asia, the
            Middle East and Europe.
          </div>
        </div>
        <div style={{ position: 'absolute', left: 80, bottom: 60, fontSize: 24, color: '#8a95a8' }}>
          oscar.defrancesca.com
        </div>
      </div>
    ),
    { ...size }
  );
}
