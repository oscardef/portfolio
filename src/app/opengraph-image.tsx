import { ImageResponse } from 'next/og';
import { getRouteMaps } from '@/lib/geo';

export const alt = 'Oscar de Francesca, software engineer, with a map of the places he has lived';
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

const routeColour = (hue: number) => oklchToHex(0.57, 0.15, hue);

export default function Image() {
  const { world } = getRouteMaps();
  const mapWidth = 820;
  const mapHeight = Math.round((world.height / world.width) * mapWidth);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#f4f5f3',
          color: '#16191d',
          fontFamily: 'sans-serif',
        }}
      >
        <svg
          width={mapWidth}
          height={mapHeight}
          viewBox={`0 0 ${world.width} ${world.height}`}
          style={{ position: 'absolute', right: -20, bottom: -10 }}
        >
          <path d={world.land} fill="#dfe3dd" />
          {world.segments
            .filter((s) => !s.side)
            .map((s, i) => (
              <path key={i} d={s.d} fill="none" stroke={routeColour(s.hueTo)} strokeWidth={4} strokeLinecap="round" />
            ))}
          {world.points.map((p) => (
            <circle
              key={p.key}
              cx={(p.x / 100) * world.width}
              cy={(p.y / 100) * world.height}
              r={7}
              fill={routeColour(p.hue)}
              stroke="#f4f5f3"
              strokeWidth={3}
            />
          ))}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '72px 80px', maxWidth: 700 }}>
          <div style={{ fontSize: 84, fontWeight: 600, lineHeight: 0.95, letterSpacing: '-0.04em' }}>
            Oscar de Francesca
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.3, marginTop: 28, color: '#4d555d' }}>
            Software engineer, Swedish and American, born in Bangkok and raised across Asia, the
            Middle East and Europe.
          </div>
        </div>
        <div style={{ position: 'absolute', left: 80, bottom: 56, fontSize: 24, color: '#4d555d' }}>
          oscar.defrancesca.com
        </div>
      </div>
    ),
    { ...size }
  );
}
