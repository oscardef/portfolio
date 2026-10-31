import { readFileSync } from 'fs';
import path from 'path';
import { ImageResponse } from 'next/og';

export const alt = 'Oscar de Francesca, software engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The route's colours, from Bangkok to Basel, as hex (Satori can't read oklch)
const ROUTE = ['#e0a64a', '#e57a8a', '#c58bd9', '#8f9bf0', '#4fc4c4'];

export default function Image() {
  const portrait = readFileSync(path.join(process.cwd(), 'public/images/portrait.jpg')).toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 80px',
          background: 'radial-gradient(circle at 78% 30%, #1d2547 0%, #0c1220 55%)',
          color: '#eef2f8',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 620 }}>
          <div style={{ fontSize: 88, fontWeight: 600, lineHeight: 0.98, letterSpacing: '-0.035em' }}>
            Oscar de Francesca
          </div>
          <div style={{ fontSize: 31, lineHeight: 1.32, marginTop: 30, color: '#b0bacb' }}>
            Software engineer, Swedish and American, born in Bangkok and raised across Asia, the Middle East
            and Europe.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 44 }}>
            {ROUTE.map((c) => (
              <div key={c} style={{ width: 34, height: 6, borderRadius: 3, background: c, marginRight: 8 }} />
            ))}
            <div style={{ fontSize: 24, color: '#8a95a8', marginLeft: 14 }}>oscar.defrancesca.com</div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            padding: 5,
            borderRadius: 40,
            background: `linear-gradient(140deg, ${ROUTE.join(', ')})`,
          }}
        >
          <img
            src={`data:image/jpeg;base64,${portrait}`}
            alt=""
            width={372}
            height={496}
            style={{ borderRadius: 35, objectFit: 'cover' }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
