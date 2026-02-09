import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Oscar de Francesca — Software Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0b 0%, #1a1a2e 50%, #0a0a0b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            O
          </div>
          <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)' }}>
            oscar.defrancesca.com
          </span>
        </div>
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Oscar de Francesca
        </h1>
        <p
          style={{
            fontSize: '28px',
            color: 'rgba(255,255,255,0.65)',
            marginTop: '16px',
            lineHeight: 1.4,
          }}
        >
          Software Engineer · ML · Systems
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '40px',
          }}
        >
          {['Python', 'TypeScript', 'C++', 'PyTorch', 'React'].map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.08)',
                padding: '6px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
