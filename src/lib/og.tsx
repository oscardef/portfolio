import { readFileSync } from 'fs';
import path from 'path';
import { ImageResponse } from 'next/og';

/* eslint-disable @next/next/no-img-element -- these images are drawn into a PNG, not served to a browser */

/**
 * The card a link to a project or role shows when it is shared: the title
 * and a line about it on the left, a picture on the right, in the site's
 * colours. Drawn at build time, one per page.
 */

export const ogSize = { width: 1200, height: 630 };

// A file under public/ as a data URI (the renderer can't fetch local files)
function asDataUri(publicPath: string): string {
  const file = readFileSync(path.join(process.cwd(), 'public', publicPath));
  const type = publicPath.endsWith('.svg')
    ? 'image/svg+xml'
    : file[0] === 0xff && file[1] === 0xd8 // some .png files here are JPEGs inside
      ? 'image/jpeg'
      : 'image/png';
  return `data:${type};base64,${file.toString('base64')}`;
}

const cut = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, text.lastIndexOf(' ', max))}…`;

export function ogCard({
  kind,
  title,
  subtitle,
  line,
  picture,
  logo,
}: {
  kind: string;
  title: string;
  subtitle?: string;
  line: string;
  // A screenshot or photo for the right-hand side (projects)
  picture?: string;
  // A logo, shown on a white tile above the portrait (roles)
  logo?: string;
}) {
  const titleSize = title.length <= 14 ? 92 : title.length <= 26 ? 72 : 58;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 72px',
        background: 'radial-gradient(circle at 80% 30%, #1d2547 0%, #0c1220 58%)',
        color: '#eef2f8',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: 600 }}>
        <div style={{ fontSize: 24, letterSpacing: '0.14em', color: '#b4b8ff' }}>
          {kind.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 600,
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            marginTop: 18,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 34, lineHeight: 1.2, marginTop: 14, color: '#eef2f8' }}>
            {cut(subtitle, 60)}
          </div>
        )}
        <div style={{ fontSize: 27, lineHeight: 1.35, marginTop: 22, color: '#b0bacb' }}>
          {cut(line, 120)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 40 }}>
          <div
            style={{
              width: 44,
              height: 6,
              borderRadius: 3,
              background: '#6d72f6',
              marginRight: 18,
            }}
          />
          <div style={{ fontSize: 24, color: '#8a95a8' }}>
            Oscar de Francesca · oscar.defrancesca.com
          </div>
        </div>
      </div>

      {picture ? (
        <div
          style={{
            display: 'flex',
            padding: 2,
            borderRadius: 30,
            background: 'rgba(255, 255, 255, 0.16)',
            boxShadow: '0 30px 90px -20px rgba(109, 114, 246, 0.55)',
          }}
        >
          <img
            src={asDataUri(picture)}
            alt=""
            width={420}
            height={420}
            style={{ borderRadius: 28, objectFit: 'cover', objectPosition: 'left top' }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {logo && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 300,
                height: 150,
                borderRadius: 28,
                background: '#ffffff',
                marginBottom: 28,
              }}
            >
              <img
                src={asDataUri(logo)}
                alt=""
                width={220}
                height={96}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <img
            src={asDataUri('/images/portrait.jpg')}
            alt=""
            width={logo ? 190 : 372}
            height={logo ? 190 : 496}
            style={{
              borderRadius: logo ? 95 : 35,
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.16)',
            }}
          />
        </div>
      )}
    </div>,
    { ...ogSize }
  );
}
